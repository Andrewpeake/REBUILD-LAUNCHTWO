# UAM UCalgary Website

A modern, responsive website for the Urban Air Mobility team at the University of Calgary. The site features a dynamic, interactive interface with parallax effects, mobile-responsive design, and smooth animations.

## Features

- Interactive 3D Tesseract background animation
- Smooth scrolling and section transitions
- Mobile-responsive design with touch-friendly interfaces
- Dynamic content reveal animations
- Glass-morphism design elements
- Optimized performance with lazy loading
- Cross-browser compatible

## Technology Stack

- HTML5
- CSS3 (with modern features like backdrop-filter)
- Vanilla JavaScript (ES6+)
- GSAP for animations
- No external dependencies or frameworks

## Project Structure

```
/
├── index.html              # Main entry point
├── styles.css             # Global styles
├── js/                    # JavaScript modules
│   ├── UAMUCalgary.js   # Main JavaScript entry
│   ├── navigation.js     # Navigation functionality
│   ├── tesseract.js      # Background animation
│   ├── intro.js          # Intro animation
│   ├── sectionloader.js  # Dynamic section loading
│   └── sections-js/      # Section-specific JavaScript
├── sections-html/        # HTML sections
├── bios/                # Team member bios
└── assets/             # Images and other assets
```

## Setup

1. Clone the repository
2. No build process required - pure HTML/CSS/JS
3. Serve through a web server (e.g., Live Server for VS Code)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Support

- Responsive design for all screen sizes
- Touch-optimized interactions
- Mobile-first media queries
- Optimized performance for mobile devices

## Performance Optimizations

- Lazy loading of sections
- Optimized animations
- Efficient event handling
- Smart resource loading

## Development

The project uses a modular architecture for easy maintenance and scalability:

- Each section has its own HTML and JavaScript files
- Styles are organized by component
- JavaScript modules handle specific functionality
- Event delegation for better performance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- GSAP for animation library
- Inter & Orbitron fonts from Google Fonts
- University of Calgary Urban Air Mobility Team 