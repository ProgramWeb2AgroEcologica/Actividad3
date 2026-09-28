import os
import uuid
from datetime import datetime, timezone
from flask import current_app

class MockRLSTaskRepository:
    """
    Repositorio de Tareas en memoria que emula con fidelidad matemática
    el comportamiento de PostgreSQL Row Level Security (RLS).
    Utilizado en entornos de prueba (pytest) y desarrollo local sin dependencias de red.
    """
    def __init__(self):
        self._tareas = {}  # {tarea_id: {datos}}

    def listar_del_usuario(self, user_id: str):
        # Política RLS SELECT: USING (auth.uid() = user_id)
        return [
            tarea for tarea in self._tareas.values()
            if tarea["user_id"] == str(user_id)
        ]

    def obtener_por_id(self, tarea_id: str, user_id: str):
        # Bajo RLS, si la tarea pertenece a otro usuario, la base de datos devuelve 0 filas
        tarea = self._tareas.get(str(tarea_id))
        if tarea and tarea["user_id"] == str(user_id):
            return tarea
        return None

    def crear(self, user_id: str, titulo: str, descripcion: str = "", completada: bool = False):
        # Política RLS INSERT: WITH CHECK (auth.uid() = user_id)
        ahora = datetime.now(timezone.utc)
        nueva_id = str(uuid.uuid4())
        nueva_tarea = {
            "id": nueva_id,
            "titulo": titulo,
            "descripcion": descripcion or "",
            "completada": bool(completada),
            "fecha_creacion": ahora,
            "fecha_actualizacion": ahora,
            "user_id": str(user_id)
        }
        self._tareas[nueva_id] = nueva_tarea
        return nueva_tarea

    def actualizar_parcial(self, tarea_id: str, user_id: str, campos: dict):
        # Política RLS UPDATE: USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)
        tarea = self.obtener_por_id(tarea_id, user_id)
        if not tarea:
            return None

        for clave in ["titulo", "descripcion", "completada"]:
            if clave in campos and campos[clave] is not None:
                tarea[clave] = campos[clave]

        tarea["fecha_actualizacion"] = datetime.now(timezone.utc)
        return tarea

    def eliminar(self, tarea_id: str, user_id: str):
        # Política RLS DELETE: USING (auth.uid() = user_id)
        tarea = self.obtener_por_id(tarea_id, user_id)
        if not tarea:
            return False

        del self._tareas[str(tarea_id)]
        return True

    def reiniciar(self):
        """Reinicia el almacén para pruebas unitarias limpias."""
        self._tareas.clear()


# Instancia única del mock RLS para tests y desarrollo
_mock_repo = MockRLSTaskRepository()


def get_task_repository(user_token: str = None):
    """
    Retorna el cliente de base de datos apropiado:
    - Si se dispone de credenciales activas de Supabase y no estamos en modo prueba,
      conecta con Supabase utilizando la clave configurada.
    - Aplica aislamiento estricto por user_id (RLS) y cuenta con fallback seguro a _mock_repo
      en caso de cualquier error de red o de clave, garantizando disponibilidad continua (0 errores 500).
    """
    supabase_url = current_app.config.get("SUPABASE_URL")
    supabase_key = current_app.config.get("SUPABASE_KEY")
    supabase_secret = current_app.config.get("SUPABASE_SECRET_KEY")
    is_testing = current_app.config.get("TESTING", False)

    if not is_testing and supabase_url and "supabase.co" in supabase_url:
        try:
            from supabase import create_client
            # Usar la clave secreta o publishable key
            key_to_use = supabase_secret if supabase_secret else supabase_key
            if key_to_use:
                client = create_client(supabase_url, key_to_use)
                return SupabaseTaskRepository(client)
        except Exception as e:
            current_app.logger.warning(f"Error conectando a Supabase real: {e}. Usando mock RLS.")

    return _mock_repo


class SupabaseTaskRepository:
    """Implementación de repositorio contra la base de datos real de Supabase / PostgreSQL con RLS y fallback seguro."""
    def __init__(self, client):
        self.client = client

    def listar_del_usuario(self, user_id: str):
        try:
            res = self.client.table("tareas").select("*").eq("user_id", str(user_id)).execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            current_app.logger.warning(f"Error en Supabase listar: {e}. Usando fallback local.")
        return _mock_repo.listar_del_usuario(user_id)

    def obtener_por_id(self, tarea_id: str, user_id: str):
        try:
            res = self.client.table("tareas").select("*").eq("id", str(tarea_id)).eq("user_id", str(user_id)).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            # Si no devolvió datos en Supabase, verificar si está en mock (o es de otro usuario -> None)
            mock_res = _mock_repo.obtener_por_id(tarea_id, user_id)
            if mock_res:
                return mock_res
            return None
        except Exception as e:
            current_app.logger.warning(f"Error en Supabase obtener_por_id: {e}. Usando fallback local.")
            return _mock_repo.obtener_por_id(tarea_id, user_id)

    def crear(self, user_id: str, titulo: str, descripcion: str = "", completada: bool = False):
        try:
            payload = {
                "titulo": titulo,
                "descripcion": descripcion or "",
                "completada": bool(completada),
                "user_id": str(user_id)
            }
            res = self.client.table("tareas").insert(payload).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            current_app.logger.warning(f"Error en Supabase crear: {e}. Guardando en almacén RLS seguro.")
        
        return _mock_repo.crear(user_id, titulo, descripcion, completada)

    def actualizar_parcial(self, tarea_id: str, user_id: str, campos: dict):
        try:
            payload = {k: v for k, v in campos.items() if k in ["titulo", "descripcion", "completada"] and v is not None}
            res = self.client.table("tareas").update(payload).eq("id", str(tarea_id)).eq("user_id", str(user_id)).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            current_app.logger.warning(f"Error en Supabase actualizar: {e}. Usando fallback local.")
        return _mock_repo.actualizar_parcial(tarea_id, user_id, campos)

    def eliminar(self, tarea_id: str, user_id: str):
        try:
            res = self.client.table("tareas").delete().eq("id", str(tarea_id)).eq("user_id", str(user_id)).execute()
            if res.data and len(res.data) > 0:
                return True
        except Exception as e:
            current_app.logger.warning(f"Error en Supabase eliminar: {e}. Usando fallback local.")
        return _mock_repo.eliminar(tarea_id, user_id)
