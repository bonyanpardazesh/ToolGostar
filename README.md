# ToolGostar Industrial Group Website

A modern, responsive website for ToolGostar Industrial Group - a leading manufacturer of water and wastewater treatment equipment.

## 🚀 Features

- **Modern Design**: Clean, professional design with smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **Interactive**: 3D hero animation using Three.js
- **Accessible**: Built with accessibility best practices
- **Fast**: Optimized for performance with modern build tools
- **SEO Ready**: Proper meta tags and structured data

## 🛠️ Tech Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with custom properties and Grid/Flexbox
- **JavaScript (ES6+)**: Modular JavaScript with modern features
- **Three.js**: 3D graphics and animations
- **Vite**: Fast build tool and development server
- **Font Awesome**: Icon library

## 📁 Project Structure

```
webPage/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── css/
│   │   ├── main.css        # Main CSS entry point
│   │   ├── base/           # Base styles (reset, variables, typography)
│   │   ├── components/     # Reusable component styles
│   │   ├── pages/          # Page-specific styles
│   │   └── utilities/      # Utility classes and animations
│   ├── js/
│   │   ├── main.js         # Main JavaScript entry point
│   │   ├── components/     # JavaScript components
│   │   └── utils/          # Utility functions
│   ├── shaders/
│   │   ├── vertex.glsl     # Vertex shader
│   │   └── fragment.glsl   # Fragment shader
│   └── assets/
│       ├── images/         # Image assets
│       └── icons/          # Icon assets
├── package.json            # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd webPage
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run serve` - Serve production build on port 3000

## 🎨 Customization

### Colors and Variables

All colors and design tokens are defined in `src/css/base/variables.css`. You can easily customize:

- Primary and secondary colors
- Typography settings
- Spacing and sizing
- Border radius and shadows
- Animation timings

### Adding New Components

1. Create CSS file in `src/css/components/`
2. Create JavaScript file in `src/js/components/`
3. Import in main files
4. Add HTML structure

### Adding New Pages

1. Create CSS file in `src/css/pages/`
2. Add section to HTML
3. Update navigation if needed

## 📱 Responsive Design

The website is fully responsive with breakpoints at:
- Mobile: 480px and below
- Tablet: 768px and below
- Desktop: 769px and above

## ♿ Accessibility

The website includes:
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Skip links

## 🚀 Performance

- Optimized images and assets
- Lazy loading for images
- Minified CSS and JavaScript
- Modern build tools for optimization
- Efficient animations

## 📞 Contact

For questions about this website or ToolGostar Industrial Group:

- **Phone**: 021-22357761-3
- **Mobile**: 09108108132
- **Email**: toolgostar@yahoo.com
- **Address**: No. 10, Soheil Complex, Alameh Tabatabaie St, Saadat Abad, Tehran, Iran

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 Changelog

### Version 1.0.0
- Initial release
- Modern project structure
- Responsive design
- 3D hero animation
- Contact form functionality
- Gallery with lightbox
- Accessibility features

