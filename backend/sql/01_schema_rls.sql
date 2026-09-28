-- ==============================================================================
-- ACTIVIDAD 03: Backend Seguro, JWT, PostgreSQL y Row Level Security (RLS)
-- Docente: Ing. Jimmy Requena (Bolivianotech)
-- Estudiantes: Eduar Heredia, Limbert David Quispe Osco
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- SECCIÓN A: LABORATORIO DOCENTE — TABLA 'TAREAS' CON RLS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT DEFAULT '',
    completada BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

CREATE INDEX IF NOT EXISTS idx_tareas_user_id ON public.tareas(user_id);
CREATE INDEX IF NOT EXISTS idx_tareas_completada ON public.tareas(completada);

ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tareas_select_propias ON public.tareas;
DROP POLICY IF EXISTS tareas_insert_propias ON public.tareas;
DROP POLICY IF EXISTS tareas_update_propias ON public.tareas;
DROP POLICY IF EXISTS tareas_delete_propias ON public.tareas;

-- Políticas RLS para tareas
CREATE POLICY tareas_select_propias ON public.tareas
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY tareas_insert_propias ON public.tareas
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY tareas_update_propias ON public.tareas
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY tareas_delete_propias ON public.tareas
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);


-- ==============================================================================
-- SECCIÓN B: PROYECTO SOCIOFORMATIVO — FERIA AGROECOLÓGICA SANTA CRUZ
-- ==============================================================================

-- 1. Tabla PRODUCTORES (Perfil del agricultor vinculado a su cuenta en auth.users)
CREATE TABLE IF NOT EXISTS public.productores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    comunidad_origen VARCHAR(100) NOT NULL, -- Ej: Samaipata, El Torno, Porongo, Vallegrande
    telefono_contacto VARCHAR(20) NOT NULL,
    asociacion VARCHAR(150) DEFAULT 'Asociación de Productores Ecológicos',
    estado_certificacion VARCHAR(50) DEFAULT 'Agroecológico Verificado',
    canal_abierto_activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productores_user_id ON public.productores(user_id);
CREATE INDEX IF NOT EXISTS idx_productores_comunidad ON public.productores(comunidad_origen);

ALTER TABLE public.productores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Productores:
-- Lectura pública para que los consumidores conozcan a sus productores
CREATE POLICY productores_lectura_publica ON public.productores
    FOR SELECT TO anon, authenticated
    USING (canal_abierto_activo = TRUE);

-- Cada productor solo modifica su propio perfil
CREATE POLICY productores_modificar_propio ON public.productores
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 2. Tabla PRODUCTOS (Cosechas semanales ofertadas por los productores)
CREATE TABLE IF NOT EXISTS public.productos (
    id SERIAL PRIMARY KEY,
    productor_id UUID NOT NULL REFERENCES public.productores(id) ON DELETE CASCADE,
    nombre_producto VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- Hortalizas, Frutas, Tubérculos, Artesanales, Granja
    unidad_medida VARCHAR(30) NOT NULL DEFAULT 'Kg',
    precio_unitario_bs NUMERIC(10,2) NOT NULL CHECK (precio_unitario_bs > 0),
    stock_disponible INT NOT NULL DEFAULT 0 CHECK (stock_disponible >= 0),
    foto_url TEXT DEFAULT '',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_publicacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productos_productor ON public.productos(productor_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos(activo);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Productos:
-- Lectura pública para el catálogo del consumidor
CREATE POLICY productos_lectura_catalogo ON public.productos
    FOR SELECT TO anon, authenticated
    USING (activo = TRUE);

-- Inserción, actualización y borrado exclusivo para el productor dueño de la cosecha
CREATE POLICY productos_gestion_productor ON public.productos
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.productores p
            WHERE p.id = productos.productor_id AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.productores p
            WHERE p.id = productos.productor_id AND p.user_id = auth.uid()
        )
    );


-- 3. Tabla PEDIDOS (Reservas directas de consumidores urbanos)
CREATE TABLE IF NOT EXISTS public.pedidos (
    id SERIAL PRIMARY KEY,
    codigo_reserva VARCHAR(20) NOT NULL UNIQUE, -- Ej: ECO-2168
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_telefono VARCHAR(20) NOT NULL, -- Expresión regular cruceña: ^[67]\d{7}$
    punto_retiro VARCHAR(150) NOT NULL,    -- Ej: Feria Barrio Lindo, Punto Ferial Samaipata
    fecha_retiro DATE NOT NULL,
    total_pedido_bs NUMERIC(10,2) NOT NULL CHECK (total_pedido_bs >= 0),
    estado_pedido VARCHAR(50) NOT NULL DEFAULT 'Registrado', -- Registrado, Confirmado, En Cosecha, Listo en Feria, Entregado, Cancelado
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Opcional si el cliente inició sesión
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_codigo ON public.pedidos(codigo_reserva);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_tel ON public.pedidos(cliente_telefono);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado_pedido);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Pedidos:
-- Inserción libre desde la web (consumidores sin login pueden reservar)
CREATE POLICY pedidos_creacion_publica ON public.pedidos
    FOR INSERT TO anon, authenticated
    WITH CHECK (TRUE);

-- Consulta por código o teléfono para el rastreador de cosechas
CREATE POLICY pedidos_consulta_cliente ON public.pedidos
    FOR SELECT TO anon, authenticated
    USING (TRUE);

-- Actualización de estado en el Tablero de Despacho Campesino
CREATE POLICY pedidos_despacho_productor ON public.pedidos
    FOR UPDATE TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);


-- 4. Tabla DETALLE_PEDIDOS (Desglose de productos reservados)
CREATE TABLE IF NOT EXISTS public.detalle_pedidos (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario_bs NUMERIC(10,2) NOT NULL,
    subtotal_bs NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_detalle_pedido_id ON public.detalle_pedidos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_detalle_producto_id ON public.detalle_pedidos(producto_id);

ALTER TABLE public.detalle_pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY detalle_pedidos_politica_general ON public.detalle_pedidos
    FOR ALL TO anon, authenticated
    USING (TRUE)
    WITH CHECK (TRUE);


-- ==============================================================================
-- TRIGGER PARA ACTUALIZAR fecha_actualizacion AUTOMÁTICAMENTE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_fecha_tareas ON public.tareas;
CREATE TRIGGER trg_actualizar_fecha_tareas
    BEFORE UPDATE ON public.tareas
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_fecha_modificacion();

DROP TRIGGER IF EXISTS trg_actualizar_fecha_productos ON public.productos;
CREATE TRIGGER trg_actualizar_fecha_productos
    BEFORE UPDATE ON public.productos
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_fecha_modificacion();

DROP TRIGGER IF EXISTS trg_actualizar_fecha_pedidos ON public.pedidos;
CREATE TRIGGER trg_actualizar_fecha_pedidos
    BEFORE UPDATE ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_fecha_modificacion();
