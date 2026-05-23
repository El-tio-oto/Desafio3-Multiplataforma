-- Zenith Finance - Esquema de Base de Datos para Supabase

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. TABLA DE PERFILES (Vinculada a auth.users)
-- =========================================================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para profiles
CREATE POLICY "Permitir lectura del propio perfil" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Permitir actualización del propio perfil" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- =========================================================================
-- 2. TRIGGER PARA CREACIÓN AUTOMÁTICA DE PERFIL (auth.users -> profiles)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Usuario Zenith'),
        new.email,
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 3. TABLA DE CUENTAS (Accounts)
-- =========================================================================
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'credit_card', 'savings', 'other')),
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    color TEXT DEFAULT '#00C2FF',
    icon TEXT DEFAULT 'wallet-outline',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todas las acciones de cuentas del usuario"
    ON public.accounts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 4. TABLA DE CATEGORÍAS (Categories)
-- =========================================================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL indica categoría global
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
    color TEXT DEFAULT '#00C2FF',
    icon TEXT DEFAULT 'list-outline',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de categorías propias y globales"
    ON public.categories FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Permitir inserción de categorías propias"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir modificación de categorías propias"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir eliminación de categorías propias"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- =========================================================================
-- 5. TABLA DE TRANSACCIONES (Transactions)
-- =========================================================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todas las acciones de transacciones del usuario"
    ON public.transactions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 6. TRIGGER PARA ACTUALIZAR AUTOMÁTICAMENTE EL BALANCE DE CUENTAS
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Caso 1: Nueva transacción
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.type = 'income') THEN
            UPDATE public.accounts 
            SET balance = balance + NEW.amount 
            WHERE id = NEW.account_id;
        ELSIF (NEW.type = 'expense') THEN
            UPDATE public.accounts 
            SET balance = balance - NEW.amount 
            WHERE id = NEW.account_id;
        END IF;
        
    -- Caso 2: Transacción eliminada
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.type = 'income') THEN
            UPDATE public.accounts 
            SET balance = balance - OLD.amount 
            WHERE id = OLD.account_id;
        ELSIF (OLD.type = 'expense') THEN
            UPDATE public.accounts 
            SET balance = balance + OLD.amount 
            WHERE id = OLD.account_id;
        END IF;

    -- Caso 3: Transacción modificada
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Revertir balance anterior
        IF (OLD.type = 'income') THEN
            UPDATE public.accounts 
            SET balance = balance - OLD.amount 
            WHERE id = OLD.account_id;
        ELSIF (OLD.type = 'expense') THEN
            UPDATE public.accounts 
            SET balance = balance + OLD.amount 
            WHERE id = OLD.account_id;
        END IF;
        
        -- Aplicar nuevo balance
        IF (NEW.type = 'income') THEN
            UPDATE public.accounts 
            SET balance = balance + NEW.amount 
            WHERE id = NEW.account_id;
        ELSIF (NEW.type = 'expense') THEN
            UPDATE public.accounts 
            SET balance = balance - NEW.amount 
            WHERE id = NEW.account_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_transaction_change
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_account_balance();

-- =========================================================================
-- 7. TABLA DE PRESUPUESTOS (Budgets)
-- =========================================================================
CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_category_period UNIQUE (user_id, category_id, period, start_date)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todas las acciones de presupuestos del usuario"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 8. TABLA DE METAS DE AHORRO (Savings Goals)
-- =========================================================================
CREATE TABLE public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todas las acciones de metas del usuario"
    ON public.savings_goals FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 9. PRE-SEED DE CATEGORÍAS GLOBALES
-- =========================================================================
INSERT INTO public.categories (name, type, color, icon) VALUES
-- Ingresos
('Sueldo', 'income', '#00E676', 'cash-outline'),
('Inversiones', 'income', '#00B0FF', 'trending-up-outline'),
('Regalos/Premios', 'income', '#FFD600', 'gift-outline'),
('Otros Ingresos', 'income', '#B0BEC5', 'ellipsis-horizontal-outline'),
-- Egresos (Gastos)
('Comida/Supermercado', 'expense', '#FF5252', 'restaurant-outline'),
('Transporte/Combustible', 'expense', '#FF9100', 'car-outline'),
('Servicios (Luz, Agua, Internet)', 'expense', '#2979FF', 'flash-outline'),
('Vivienda/Alquiler', 'expense', '#AA00FF', 'home-outline'),
('Entretenimiento/Ocio', 'expense', '#FF4081', 'game-controller-outline'),
('Salud/Médico', 'expense', '#00E5FF', 'medical-outline'),
('Educación', 'expense', '#76FF03', 'book-outline'),
('Ropa/Accesorios', 'expense', '#E040FB', 'shirt-outline'),
('Viajes', 'expense', '#00B0FF', 'airplane-outline'),
('Otros Gastos', 'expense', '#90A4AE', 'ellipsis-horizontal-outline');
