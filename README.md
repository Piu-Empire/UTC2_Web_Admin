# UTC2 Web Admin

**UTC2 Web Admin** is a Web-based administration dashboard designed for university staff at the University of Transport and Communications, Campus in Ho Chi Minh City (UTC2). The system allows the university to easily manage students, tuition fees, academic results, approve public services, and send direct notifications to students.

**Live Demo Access:** [https://utc-2-web-admin.vercel.app/](https://utc-2-web-admin.vercel.app/)

**Related repositories:**
- [UTC2_App_Reborn](https://github.com/Piu-Empire/UTC2_App_Reborn) — Mobile App for Students
- [UTC2_Web_Server](https://github.com/Piu-Empire/UTC2_Web_Server) — Backend API & Database

---

## Screenshots

| Dashboard | Student Management |
| :---: | :---: |
| ![Dashboard](docs/images/dashboard.png) | ![Students](docs/images/students.png) |

| Public Services Management | Tuition Management |
| :---: | :---: |
| ![Services](docs/images/services.png) | ![Tuition](docs/images/tuition.png) |

---

## Demo Video

**Watch here:** https://youtu.be/your-video-id

*(Or replace the above link with a Demo GIF file here)*
<!-- ![Demo](docs/demo.gif) -->

---

## Key Features

The Web Admin provides in-depth administrative modules:
1. **Dashboard:** Overview statistics of the number of students, tuition revenue, and pending public service requests.
2. **Student Management:** Add, edit, delete student information, and manage login accounts.
3. **Academic & Schedule Management:** Manage classes, update academic results, class schedules, exam schedules, and handle academic warnings.
4. **Assessment Management:** Manage training points and evaluate students.
5. **Service Requests:** Receive, approve, or reject requests (ID card re-issuance, Student loans, Transcripts...).
6. **Dormitory Management:** Approve room registrations and manage dormitory invoices.
7. **Notification:** Compose and send urgent push notifications to the Mobile app via Firebase.
8. **Feedback:** View and process feedback from students.
9. **Data Import/Export:** Support importing mass lists of grades, tuition fees, and schedules from Excel files.

---

## Tech Stack

- **Framework:** React.js (v18) with Vite
- **UI & Styling:** TailwindCSS, Framer Motion, Lucide React
- **Routing:** React Router DOM (v6)
- **Data Fetching & State:** Axios, React Hot Toast
- **File Processing:** xlsx (Read/Write Excel files)

---

## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/Piu-Empire/UTC2_Web_Admin.git
   ```
2. Install dependencies (Node.js 18+ required):
   ```bash
   npm install
   ```
3. Configure environment variables (`.env` or `.env.production`):
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1.0
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Deployment

The Web Admin is designed to be easily deployed to cloud platforms:
- **Hosting:** The project is practically deployed on **Vercel** (Access at: [https://utc-2-web-admin.vercel.app/](https://utc-2-web-admin.vercel.app/)). The system automatically recognizes the Vite/React project and builds it into static files.
- **Configuration:** The `vercel.json` file is already included for standard routing (SPA Routing), ensuring no 404 errors occur when reloading pages.

---

## Architecture

```text
src
├── api                 (Axios configuration and API call files to the Backend)
├── components          (Shared UI components: Sidebar, Header, Button, Modal...)
├── pages               (Main administrative screens)
│   ├── academic        (Academic results, classes)
│   ├── assessment      (Training point assessment)
│   ├── dormitory       (Dormitory)
│   ├── import          (Excel data import)
│   ├── schedules       (Schedules)
│   ├── students        (Student management)
│   └── ...             (Dashboard, Notification, Service Request, Feedback)
├── router              (React Router configuration)
├── utils               (Helper functions: date formatting, currency formatting, file handling...)
├── App.jsx             (Root component)
└── main.jsx            (Application entry point)
```

The Web Admin connects directly to the **UTC2 Web Server (Backend)** via REST APIs to perform all administrative tasks and coordinate data flow down to the **Mobile App**.
