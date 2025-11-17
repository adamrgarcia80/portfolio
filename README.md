# Portfolio Site

An austere, academic portfolio site with an admin panel for content management.

## Features

- Clean, minimal design with white Vend Sans font on black background
- Admin panel for managing content
- Upload images and videos
- Add and edit text sections
- Simple password-protected admin access

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

3. Access the site:
- Portfolio: http://localhost:3000
- Admin Panel: http://localhost:3000/admin.html

## Default Admin Password

The default admin password is `admin123`. You can change this by setting the `ADMIN_PASSWORD` environment variable:

```bash
ADMIN_PASSWORD=yourpassword npm start
```

## File Structure

- `public/` - Frontend files (HTML, CSS, JS)
- `uploads/` - Uploaded images and videos (created automatically)
- `data/` - Content data storage (created automatically)
- `server.js` - Express server and API

## Usage

1. Visit the admin panel and enter the password
2. Add text sections with titles and content
3. Upload images and videos
4. Content will appear on the main portfolio page
5. Edit or delete content from the admin panel


