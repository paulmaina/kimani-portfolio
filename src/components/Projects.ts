
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
    title: 'Project One',
    description: 'A brief description of your first project. What was the challenge? What was your solution? What technologies did you use?',
    image: '/images/project-1.jpg',
    liveUrl: '#',
    githubUrl: '#',
    tags: ['React', 'Node.js', 'Express', 'MongoDB'],
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
