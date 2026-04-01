require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');

async function updateAdmin() {
  const email = 'saiyedhamza7171@gmail.com';
  const password = 'Saiyed@5747';

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const { data, error } = await supabase
    .from('profiles')
    .update({
      role: 'admin',
      password_hash: passwordHash
    })
    .eq('email', email.toLowerCase())
    .select()
    .single();

  if (error) {
    console.error('ERROR:', error.message);
  } else {
    console.log('SUCCESS! Account updated to admin.');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', data.role);
    console.log('ID:', data.id);
    console.log('All columns:', Object.keys(data).join(', '));
  }
  process.exit(0);
}

updateAdmin().catch(err => { console.error('Fatal:', err); process.exit(1); });
