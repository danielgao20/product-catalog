const bcrypt = require('bcryptjs')

const passwordHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
const testPassword = 'wiley123'

async function testPasswordVerification() {
  try {
    console.log('Testing password verification...')
    console.log('Hash:', passwordHash)
    console.log('Password:', testPassword)
    
    const isValid = await bcrypt.compare(testPassword, passwordHash)
    console.log('Password valid:', isValid)
    
    // Let's also test with the original password that this hash was created for
    const originalPassword = 'admin123'
    const isValidOriginal = await bcrypt.compare(originalPassword, passwordHash)
    console.log('Original password (admin123) valid:', isValidOriginal)
    
  } catch (err) {
    console.error('Exception:', err)
  }
}

testPasswordVerification()
