
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
    description: 'DevOps-focused personal portfolio showcasing cloud, automation, and container projects, built with React, FastAPI, featuring secure contact backend and continuous deployment workflows.',
    image: '/images/project-1.jpg',
    liveUrl: 'https://paulkimani.vercel.app/',
    githubUrl: 'https://github.com/paulmaina/kimani-portfolio',
    tags: ['React', 'FastAPI', 'Supabase', 'CI/CD', 'Containers', 'Cloud'],
  },
  {
    title: 'Always Free Kubernetes Platform with Terraform & GitOps',
    description: 'Cost-free Oracle Cloud Kubernetes cluster using Terraform and GitOps, leveraging Always Free tier with ArgoCD, Gateway API, Teleport, monitoring, and secure ingress.',
    image: '/images/project-2.jpg',
    liveUrl: '#',
    githubUrl: '#',
    tags: ['Kubernetes', 'Oracle Cloud', 'Terraform', 'ArgoCD', 'DevOps', 'Gateway API', 'Teleport', 'OIDC', 'Cert-Manager'],
  },
  {
    title: 'Work in Progress..',
    description: 'Work in Progress..',
    image: '/images/project-3.jpg',
    liveUrl: '#',
    githubUrl: '#',
    tags: ['JavaScript', 'HTML', 'CSS', 'OpenWeatherMap API'],
  },
  // Add more projects here
];
