-- Update Wiley's admin user with the correct password hash for 'wiley123'
UPDATE admin_users 
SET password_hash = '$2b$10$k2Cgn8ijrlnYya7E.na9buuKMFjA93tHtmDCiDaLV27ZRqr.HuvFu'
WHERE email = 'wiley@gmail.com';

-- Verify the update
SELECT email, name, role, is_active FROM admin_users WHERE email = 'wiley@gmail.com';
