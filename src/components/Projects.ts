
export interface Project {
  title: string;
  description: string;
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    title: 'Personal Portfolio & Technical Showcase',
    description: 'DevOps-focused personal portfolio showcasing cloud, automation, and container projects, built with React, TypeScript, FastAPI, featuring secure contact backend and continuous deployment workflows.',
    image: '/images/project-1.jpg',
    liveUrl: 'https://paulkimani.vercel.app/',
    githubUrl: 'https://github.com/paulmaina/kimani-portfolio',
    tags: ['React', 'FastAPI', 'Supabase', 'CI/CD', 'Containers', 'Cloud'],
  },
  {
    title: 'Task App',
    description: 'A description of your task app. What features does it have? How does it help users stay organized and productive?',
    image: '/images/task-app.jpg',
    liveUrl: '#',
    githubUrl: '#',
    tags: ['Vue.js', 'Firebase', 'Vuetify'],
  },
  {
    title: 'Weather Dashboard',
    description: 'A description of your weather dashboard. What APIs did you use to fetch the weather data? How did you visualize the data?',
    image: '/images/weather-dashboard.jpg',
    liveUrl: '#',
    githubUrl: '#',
    tags: ['JavaScript', 'HTML', 'CSS', 'OpenWeatherMap API'],
  },
  // Add more projects here
];
