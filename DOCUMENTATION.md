# 🕐 Intern Time Tracking System (DTR)

A modern, full-stack Next.js application for tracking internship daily time records with automatic hour calculation and export capabilities.

## ✨ Features

- ✅ **Time Tracking**: Record AM/PM time in-out times
- ✅ **Automatic Calculation**: Automatically calculates daily total hours
- ✅ **Data Validation**: Comprehensive input validation with helpful error messages
- ✅ **Export Options**: Export to PDF and CSV (Excel compatible)
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **TypeScript Support**: Fully typed for better DX
- ✅ **API Routes**: RESTful API for data persistence
- ✅ **Error Handling**: Graceful error handling throughout

## 📁 Project Structure

```
intern-time-track/
├── app/
│   ├── api/
│   │   └── time-records/
│   │       └── route.ts          # API endpoints for CRUD operations
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main page component
│   └── globals.css               # Global styles
├── components/
│   ├── TimeForm.tsx              # Form component with validation
│   └── Table.tsx                 # Data table with summary
├── hooks/
│   └── useTimeRecords.ts         # Custom hook for data operations
├── lib/
│   └── supabase.js               # Supabase client (for future use)
├── types/
│   └── index.ts                  # TypeScript type definitions
├── utils/
│   ├── timeUtils.ts              # Time calculation & validation logic
│   ├── exportUtils.ts            # PDF & CSV export functions
│   ├── calc.js                   # Legacy calculator (deprecated)
│   └── pdf.js                    # Legacy PDF export (deprecated)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Open browser**:
   Navigate to `http://localhost:3000`

## 📝 Usage

### Adding a Time Record
1. Fill in the date and all time fields (AM In, AM Out, PM In, PM Out)
2. The form validates each field in real-time
3. Click "Save Entry" to submit
4. Record appears in the table with automatic total hours calculation

### Viewing Records
- Records are displayed in a sortable table
- Shows date, times, and calculated hours
- Displays total hours for all records at the bottom

### Exporting Data
- **Export PDF**: Generates a professional DTR report (use for official submissions)
- **Export CSV**: Generates an Excel-compatible spreadsheet

## 🔧 API Endpoints

### GET /api/time-records
Fetch all time records (sorted by date, newest first)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "date": "2024-03-31",
      "am_in": "08:00",
      "am_out": "12:00",
      "pm_in": "13:00",
      "pm_out": "17:00",
      "total_hours": "8.00",
      "created_at": "2024-03-31T10:00:00Z"
    }
  ]
}
```

### POST /api/time-records
Create a new time record

**Request**:
```json
{
  "date": "2024-03-31",
  "am_in": "08:00",
  "am_out": "12:00",
  "pm_in": "13:00",
  "pm_out": "17:00",
  "total_hours": "8.00"
}
```

**Response**: Same as GET (returns created record)

## 🧮 Time Calculation Logic

The system calculates hours as follows:

```
AM Hours = AM Out - AM In
PM Hours = PM Out - PM In
Total Hours = AM Hours + PM Hours
```

**Example**:
- AM In: 08:00, AM Out: 12:00 → 4 hours
- PM In: 13:00, PM Out: 17:00 → 4 hours
- **Total: 8.00 hours**

### Edge Cases Handled
- ✅ Invalid time formats (must be HH:MM)
- ✅ End time before start time (validation error)
- ✅ Empty required fields
- ✅ Invalid dates
- ✅ PM times before AM times (warning message)

## 🔐 Environment Variables

For Supabase integration (production), create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**Note**: Currently using in-memory storage. Replace with Supabase for persistent data across sessions.

## 📊 Type Definitions

All types are in `types/index.ts`:

```typescript
interface TimeRecord {
  id?: string;
  date: string;
  am_in: string;
  am_out: string;
  pm_in: string;
  pm_out: string;
  total_hours: string;
  created_at?: string;
  updated_at?: string;
}

interface TimeFormState {
  date: string;
  am_in: string;
  am_out: string;
  pm_in: string;
  pm_out: string;
}
```

## 🎨 Component Architecture

### TimeForm Component
- Handles user input
- Real-time validation
- Error messages for each field
- Loading states during submission
- Success/error toast notifications

### Table Component
- Displays all records
- Calculates and shows total hours
- Empty state handling
- Responsive scrolling on mobile
- Delete functionality ready for backend

## 🚦 Development Best Practices

1. **Always validate**: Use `validateTimeRecord()` before submission
2. **Handle errors**: Wrap API calls in try-catch blocks
3. **Show feedback**: Use loading states and toast messages
4. **Type everything**: Never use `any` type
5. **Test edge cases**: Empty inputs, invalid times, past dates

## 🔄 Future Enhancements

- [ ] Database integration (Supabase/PostgreSQL)
- [ ] User authentication
- [ ] Monthly/weekly reports
- [ ] Recurring templates
- [ ] Photo proof for time entries
- [ ] Manager approval workflow
- [ ] Email notifications
- [ ] Dark mode support

## 📦 Dependencies

```json
{
  "next": "16.2.1",
  "react": "19.2.4",
  "typescript": "^5",
  "jspdf": "^4.2.1",
  "jspdf-autotable": "^3.8.1",
  "@supabase/supabase-js": "^2.101.0",
  "tailwindcss": "^4"
}
```

## 🐛 Troubleshooting

### Records not saving
- Check browser console for errors
- Verify API endpoint is running: `http://localhost:3000/api/time-records`
- Ensure all form fields are filled

### Export not working
- Check if records exist (empty table = no export)
- Try refreshing the page
- Check browser console for file save errors

### Times showing as invalid
- Use 24-hour format (08:00, not 8:00 AM)
- Ensure format is HH:MM
- Check end time is after start time

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Happy time tracking! 🎉**
