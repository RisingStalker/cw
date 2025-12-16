# Home Equipment Selection - Usage Guide

## 📋 Prerequisites

- PHP 8.4.1 or higher
- Node.js 20.19+ or 22.12+ (for Vite)
- Composer
- MariaDB/MySQL database
- Apache web server (for production)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 3. Configure Database

Edit `.env` file and set your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=home_equipment
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 4. Run Migrations

```bash
# Run database migrations
php artisan migrate

# (Optional) Seed with sample data
php artisan db:seed
```

### 5. Build Frontend Assets

```bash
# For development (with hot reload)
npm run dev

# OR for production
npm run build
```

### 6. Start Development Server

```bash
# Start Laravel server and Vite dev server together
composer run dev

# OR separately:
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev
```

The application will be available at:
- **Laravel**: http://localhost:8000
- **Vite Dev Server**: http://localhost:5173

## 👥 User Roles

### Admin/Employee View

**Access**: http://localhost:8000/dashboard (requires authentication)

**Features**:
- Manage Customers (create, edit, delete)
- Create Construction Projects with rooms and bathrooms
- Manage Categories and Items
- Set up Price Tables
- View all customer projects

**Default Admin User**: 
You need to create an admin user first. You can use Laravel Tinker:

```bash
php artisan tinker
```

Then run:
```php
$user = \App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@example.com',
    'password' => bcrypt('password'),
    'email_verified_at' => now(),
]);
```

### Customer View

**Access**: http://localhost:8000/customer/login

**Features**:
- Login with credentials sent via email
- Select construction projects
- Create and manage configurations
- Use configuration wizard to select equipment
- Export configurations as PDF
- Lock completed configurations
- Create copies of configurations

## 📝 Step-by-Step Usage

### For Administrators

#### 1. Create a Customer

1. Go to **Admin → Customers**
2. Click **"New Customer"**
3. Fill in customer name and email
4. Click **"Create Customer"**
5. Login credentials will be automatically sent to the customer via email

#### 2. Create a Construction Project

1. Go to **Admin → Construction Projects**
2. Click **"New Construction Project"**
3. Select the customer
4. Fill in project details:
   - Project name
   - Facade area (m²)
   - Balcony meters
   - Interior balustrade meters
5. Add rooms:
   - Click **"Add Room"**
   - Enter room name and floor space
   - Optionally select prohibited floors
6. Add bathrooms:
   - Click **"Add Bathroom"**
   - Select features (toilet, shower, bathtub)
7. Click **"Create Construction Project"**
8. A price table will be automatically assigned based on the creation year

#### 3. Create Categories

1. Go to **Admin → Categories**
2. Click **"New Category"**
3. Enter category name and order
4. Categories will be displayed in the wizard in order

#### 4. Create Items

1. Go to **Admin → Items**
2. Click **"New Item"**
3. Fill in item details:
   - Title and description
   - Category
   - Additional cost
   - Checkboxes for:
     - Requires quantity
     - Consultation required
     - Is standard option
   - Hidden until date (optional)
4. Upload images (optional)
5. Add variations (size/color) with surcharges (optional)
6. Click **"Create Item"**

#### 5. Manage Price Tables

1. Go to **Admin → Price Tables**
2. Create price tables for different years
3. Set items and variations with specific prices per price table
4. Projects automatically get assigned to the price table for their creation year

### For Customers

#### 1. Login

1. Go to http://localhost:8000/customer/login
2. Enter email and password (sent via email when account was created)
3. Click **"Login"**

#### 2. Select a Project

1. After login, you'll see **"My Projects"**
2. Click on a project card to view its configurations

#### 3. Create a Configuration

1. Click **"Create Configuration"**
2. Enter a name for your configuration
3. Click **"Create and Start Configuration"**

#### 4. Use the Configuration Wizard

1. The wizard guides you through categories one by one
2. For each category:
   - Select items (checkboxes)
   - For flooring: Select per room (calculated by area)
   - For bathrooms: Select per bathroom
   - For facade: Calculated by facade area
   - For ventilation: Calculated by number of rooms
   - Enter quantities if required
   - Select variations (size/color) if available
3. Progress is shown at the top
4. Total cost updates in real-time
5. Prohibited options are greyed out
6. Standard options must be selected (even if free)
7. Click **"Next"** to move to next category
8. Click **"Previous"** to go back
9. Progress is auto-saved every 5 seconds
10. Click **"Save and Exit"** to leave and resume later

#### 5. Complete Configuration

1. After going through all categories, click **"Complete Configuration"**
2. The configuration will be locked and cannot be edited
3. You can still view it and export as PDF

#### 6. Manage Configurations

- **View**: Click on a configuration to see details
- **Edit**: Click "Edit" on unlocked configurations
- **Lock**: Manually lock a configuration
- **Copy**: Create an editable copy of a locked configuration
- **Export PDF**: Download configuration as PDF report
- **Delete**: Remove a configuration

## 🌐 Localization

The application supports German and English translations.

**To switch language**, set in `.env`:
```env
APP_LOCALE=de  # For German
APP_LOCALE=en  # For English (default)
```

Translation files are located in:
- `lang/en/translations.php` (English)
- `lang/de/translations.php` (German)

## 🧪 Running Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/Customer/AuthenticationTest.php

# Run with filter
php artisan test --filter="Customer"
```

## 📦 Production Deployment

### 1. Build Assets

```bash
npm run build
```

### 2. Optimize Application

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Set Environment

Make sure `.env` has:
```env
APP_ENV=production
APP_DEBUG=false
```

### 4. Apache Configuration

Point your Apache virtual host to the `public` directory:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/home_equipment/public
    
    <Directory /path/to/home_equipment/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

## 🔧 Troubleshooting

### Vite Build Errors

If you see Vite errors:
1. Make sure Node.js version is 20.19+ or 22.12+
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Run `npm run build`

### Database Issues

If migrations fail:
1. Check database credentials in `.env`
2. Make sure database exists
3. Run `php artisan migrate:fresh` (WARNING: deletes all data)

### Permission Issues

```bash
# Set proper permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## 📚 Key Features

- ✅ Separate authentication for admin and customers
- ✅ Automatic price table assignment
- ✅ Real-time cost calculation
- ✅ Autosave functionality
- ✅ PDF export
- ✅ Image uploads for items
- ✅ Item variations (size/color)
- ✅ Prohibited options handling
- ✅ Progress tracking
- ✅ Configuration locking and copying
- ✅ German/English localization

## 🆘 Support

For issues or questions:
1. Check the `PROJECT_STATUS.md` file for feature status
2. Review test files for usage examples
3. Check Laravel logs in `storage/logs/laravel.log`

## 📖 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com)
- [React Documentation](https://react.dev)

