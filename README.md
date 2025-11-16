# MLM Bubble Visualization

A Next.js web application for visualizing multi-level marketing downline structures using interactive bubble/circle visualizations.

## Features

- **Central ME Circle**: The main user is displayed as the largest circle in the center
- **Multi-Level Visualization**: 
  - First Level: Up to 7 downlines (larger circles around ME)
  - Second Level: Up to 7 downlines per first-level member (smaller circles)
  - Third Level: Up to 7 downlines per second-level member (smallest circles)
- **Information Display**: Each bubble shows the member's name and starting capital
- **Color-Coded Levels**: Different colors for each hierarchy level
- **Connection Lines**: Visual connections showing the relationship structure
- **Responsive Design**: Modern UI with gradient backgrounds and smooth interactions

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── components/
│   └── bubble-visualization.tsx  # Main visualization component
├── data/
├── types/
│   └── mlm.ts               # TypeScript type definitions
└── package.json
```

## Data Structure

The application uses Supabase for data storage. The structure supports:
- ME (main user) with name and starting capital
- First level downlines (up to 7)
- Second level downlines (up to 7 per first-level member)
- Third level downlines (up to 7 per second-level member)

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- SVG for visualization

## Future Enhancements

- Database integration for persistent data
- Add/edit/delete downline members
- Interactive bubble selection and details
- Export visualization as image
- Zoom and pan functionality

