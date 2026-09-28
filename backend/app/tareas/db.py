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
      conecta con Supabase pasando el Bearer JWT para que PostgreSQL ejecute RLS en la nube.
    - En modo prueba o desarrollo local, utiliza el motor de emulación RLS.
    """
    supabase_url = current_app.config.get("SUPABASE_URL")
    supabase_key = current_app.config.get("SUPABASE_KEY")
    is_testing = current_app.config.get("TESTING", False)

    if not is_testing and supabase_url and supabase_key and "supabase.co" in supabase_url:
        try:
            from supabase import create_client
            # Instancia cliente de Supabase
            client = create_client(supabase_url, supabase_key)
            if user_token:
                # Inyectar el token del usuario para activar RLS en PostgreSQL
                client.postgrest.auth(user_token)
            return SupabaseTaskRepository(client)
        except Exception as e:
            current_app.logger.warning(f"Error conectando a Supabase real: {e}. Usando mock RLS.")

    return _mock_repo


class SupabaseTaskRepository:
    """Implementación de repositorio contra la base de datos real de Supabase / PostgreSQL con RLS."""
    def __init__(self, client):
        self.client = client

    def listar_del_usuario(self, user_id: str):
        res = self.client.table("tareas").select("*").execute()
        return res.data or []

    def obtener_por_id(self, tarea_id: str, user_id: str):
        res = self.client.table("tareas").select("*").eq("id", tarea_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def crear(self, user_id: str, titulo: str, descripcion: str = "", completada: bool = False):
        payload = {
            "titulo": titulo,
            "descripcion": descripcion,
            "completada": completada,
            "user_id": str(user_id)
        }
        res = self.client.table("tareas").insert(payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def actualizar_parcial(self, tarea_id: str, user_id: str, campos: dict):
        payload = {k: v for k, v in campos.items() if k in ["titulo", "descripcion", "completada"] and v is not None}
        res = self.client.table("tareas").update(payload).eq("id", tarea_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def eliminar(self, tarea_id: str, user_id: str):
        res = self.client.table("tareas").delete().eq("id", tarea_id).execute()
        return bool(res.data and len(res.data) > 0)
