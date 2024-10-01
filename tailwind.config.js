/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode based on class
  content: [
    './src/**/*.{html,js,vue}', // Adjust according to your file structure
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors can be added here
        primary: '#4F46E5', // Example primary color
        secondary: '#D1FAE5', // Example secondary color
        // Add more colors as needed
      },
      spacing: {
        // Customize spacing as needed
        '128': '32rem', // Example for extra large spacing
      },
      borderRadius: {
        // Customize border radius
        'xl': '1rem', // Example for extra large border radius
      },
      // Add any other customizations you need
    },
  },
  variants: {
    extend: {
      // Add variants for specific utilities
      backgroundColor: ['active', 'hover', 'focus', 'dark'],
      textColor: ['active', 'hover', 'focus', 'dark'],
    },
  },
  plugins: [
    // Add any plugins you may need
    require('@tailwindcss/forms'), // Example for form styling
    require('@tailwindcss/typography'), // Example for typography
    require('@tailwindcss/aspect-ratio'), // Example for aspect ratio
  ],
}
