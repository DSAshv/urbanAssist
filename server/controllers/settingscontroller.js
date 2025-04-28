import fs from 'fs';
import path from 'path';

// API to read .env variables
export const getEnvVariables = async (req, res) => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    const lines = envContent.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
    const envData = {};

    lines.forEach(line => {
      const [key, ...value] = line.split('=');
      envData[key.trim()] = value.join('=').trim();
    });

    res.json({ success: true, data: envData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to read env file', error: error.message });
  }
};

// ✍️ API to update .env variables
export const updateEnvVariables = async (req, res) => {
  try {
    const updates = req.body; // JSON body like { KEY: VALUE, KEY2: VALUE2, ... }

    const envContent = Object.entries(updates)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const envPath = path.resolve(process.cwd(), '.env');
    fs.writeFileSync(envPath, envContent, 'utf8');

    res.json({ success: true, message: 'Environment variables updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update env file', error: error.message });
  }
};
