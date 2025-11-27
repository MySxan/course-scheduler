# Course Scheduler

A web-based course scheduling application that helps students visualize and manage their class schedules. Create beautiful weekly timetables by adding courses manually or importing them from CSV files, then export your schedule as an image.

## Features

- **Visual Weekly Timetable** - See your entire week at a glance with a clean, organized grid view
- **Manual Course Entry** - Add courses one by one with details like name, section, days, times, and location
- **CSV Import** - Bulk import courses from CSV files for quick schedule setup
- **Customizable Display** - Adjust time ranges, show/hide weekends, change week start day, and scale the timetable
- **Export to Image** - Download your timetable as a PNG image to share or print
- **Smart Time Range** - Automatically adjusts the displayed hours based on your courses
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind CSS
- **PapaParse** - CSV parsing library
- **html-to-image** - Export timetable as image

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MySxan/course-scheduler.git
   cd course-scheduler
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
pnpm build
```

The built files will be in the `dist` directory.

## Usage

### Adding Courses Manually

1. Navigate to the **Courses** tab
2. Fill in the course form with:
   - Course name (required)
   - Section (optional)
   - Days of the week
   - Start and end times (24-hour format)
   - Location (optional)
3. Click **Add Course**

### Importing from CSV

1. Navigate to the **Courses** tab
2. Click on the CSV upload area or drag and drop a CSV file
3. Your courses will be imported automatically

#### CSV Format

The CSV file should have the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| `name` | Yes | Course name (e.g., "MATH 231") |
| `section` | No | Course section (e.g., "A1") |
| `day` | Yes | Day(s) of week - full name or abbreviation, comma-separated for multiple days |
| `startTime` | Yes | Start time in 24-hour format (HH:mm) |
| `endTime` | Yes | End time in 24-hour format (HH:mm) |
| `location` | No | Room or building |

**Example CSV:**
```csv
name,section,day,startTime,endTime,location
MATH 231,AL,"Mon,Wed,Fri",09:00,10:30,Room A101
PHY,B1,"Mon,Wed,Fri",14:00,16:00,Lab B205
ENG 115,,Friday,11:00,12:30,Room C301
```

**Supported day formats:**
- Full names: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Abbreviations: Mon, Tue, Wed, Thu, Fri, Sat, Sun

### Customizing the Timetable

In the **Preview** tab, you can adjust:

- **Time Range** - Set custom start/end hours or use smart auto-detection
- **Grid Settings** - Toggle 30-minute slots, adjust table scale and width
- **View Options** - Show/hide weekends, start week on Sunday

### Exporting Your Schedule

1. Navigate to the **Export** tab
2. Preview your timetable
3. Click the download button to save as a PNG image

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## License

This project is open source and available under the [MIT License](LICENSE).
