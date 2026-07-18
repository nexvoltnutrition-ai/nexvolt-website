-- =========================================================
-- SYSTEM AUDIT: adresses table architecture & RLS
-- =========================================================

-- 1. CURRENT TABLE STRUCTURE AWARENESS
-- Table Name: "adresses" (Note the spelling)
-- Column "id" : integer/bigint (Primary Key)
-- Column "customer_id": integer/bigint (Foreign Key to "customers" table)
-- Column "address": jsonb/text (Stores serialized address payload)
-- Column "name": text
-- Column "phone": text

-- VERIFICATION: customer_id vs auth.uid() mapping
-- ISSUE: Supabase auth.uid() returns a UUID, but customer_id is an integer.
-- FIX: We cannot directly use "customer_id = auth.uid()".
-- We must securely map ownership by checking if the address's customer_id 
-- belongs to the customer record associated with the current auth.jwt() email or phone.

-- 2. RESET POLICIES (Clear existing blocks)
DROP POLICY IF EXISTS "Customers can insert their own addresses" ON "adresses";
DROP POLICY IF EXISTS "Customers can view their own addresses" ON "adresses";
DROP POLICY IF EXISTS "Customers can update their own addresses" ON "adresses";
DROP POLICY IF EXISTS "Customers can delete their own addresses" ON "adresses";

ALTER TABLE "adresses" ENABLE ROW LEVEL SECURITY;

-- 3. EXACT SQL STATEMENTS (Ready-To-Run)

-- SELECT POLICY
CREATE POLICY "Users can view their own addresses"
ON "adresses"
FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM customers 
    WHERE email = auth.jwt() ->> 'email' 
       OR phone = auth.jwt() ->> 'phone'
  )
);

-- INSERT POLICY
CREATE POLICY "Users can insert their own addresses"
ON "adresses"
FOR INSERT
WITH CHECK (
  customer_id IN (
    SELECT id FROM customers 
    WHERE email = auth.jwt() ->> 'email' 
       OR phone = auth.jwt() ->> 'phone'
  )
);

-- UPDATE POLICY
CREATE POLICY "Users can update their own addresses"
ON "adresses"
FOR UPDATE
USING (
  customer_id IN (
    SELECT id FROM customers 
    WHERE email = auth.jwt() ->> 'email' 
       OR phone = auth.jwt() ->> 'phone'
  )
);

-- DELETE POLICY
CREATE POLICY "Users can delete their own addresses"
ON "adresses"
FOR DELETE
USING (
  customer_id IN (
    SELECT id FROM customers 
    WHERE email = auth.jwt() ->> 'email' 
       OR phone = auth.jwt() ->> 'phone'
  )
);
