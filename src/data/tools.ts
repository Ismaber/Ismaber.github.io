import { FaJava } from "react-icons/fa6";
import {
  SiPython, SiJavascript, SiC, SiCplusplus, SiKotlin,
  SiLinux, SiGnubash, SiPostgresql, SiDocker,
  SiReact, SiNextdotjs, SiGit, SiGithubactions, SiTailwindcss,
  SiOpenstack, SiQemu, SiRos, SiSqlite,
  SiAstro, SiHtml5, SiCss3, SiTypescript, SiMongodb, SiOracle,
  SiCentos,
  SiUbuntu,
  SiNodedotjs,
  SiExpress,
  SiGo
} from "react-icons/si";

export type Tool = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ring: string;
  category: "languages" | "backendDb" | "devops" | "web" | "systems" | "robotics";
};

export const TOOLS: Tool[] = [
  // Lenguajes
  { id: "python", label: "Python", icon: SiPython, ring: "ring-blue-600/50", category: "languages" },
  { id: "js", label: "JavaScript", icon: SiJavascript, ring: "ring-yellow-400/50", category: "languages" },
  { id: "ts", label: "TypeScript", icon: SiTypescript, ring: "ring-blue-700/50", category: "languages" },
  { id: "c", label: "C", icon: SiC, ring: "ring-slate-400/50", category: "languages" },
  { id: "cpp", label: "C++", icon: SiCplusplus, ring: "ring-blue-700/50", category: "languages" },
  { id: "java", label: "Java", icon: FaJava, ring: "ring-sky-700/50", category: "languages" },
  { id: "kotlin", label: "Kotlin", icon: SiKotlin, ring: "ring-violet-500/50", category: "languages" },
  { id: "go", label: "Go", icon: SiGo, ring: "ring-cyan-400/50", category: "languages" },

  // Backend / DB
  { id: "sql", label: "SQL", icon: SiSqlite, ring: "ring-sky-900/50", category: "backendDb" },
  { id: "nodejs", label: "NodeJS", icon: SiNodedotjs, ring: "ring-lime-500/50", category: "backendDb" },
  { id: "express", label: "Express", icon: SiExpress, ring: "ring-gray-500/50", category: "backendDb" },
  { id: "postgres", label: "PostgreSQL", icon: SiPostgresql, ring: "ring-blue-800/50", category: "backendDb" },
  { id: "mongo", label: "MongoDB", icon: SiMongodb, ring: "ring-green-600/50", category: "backendDb" },
  { id: "oracle", label: "Oracle", icon: SiOracle, ring: "ring-red-600/50", category: "backendDb" },

  // DevOps
  { id: "docker", label: "Docker / Docker Compose", icon: SiDocker, ring: "ring-sky-500/50", category: "devops" },
  { id: "git", label: "Git", icon: SiGit, ring: "ring-orange-600/50", category: "devops" },
  { id: "gha", label: "GitHub Actions", icon: SiGithubactions, ring: "ring-blue-500/50", category: "devops" },
  { id: "cicd", label: "CI / CD", icon: SiGithubactions, ring: "ring-indigo-500/50", category: "devops" },

  // Web
  { id: "html", label: "HTML5", icon: SiHtml5, ring: "ring-orange-500/50", category: "web" },
  { id: "css", label: "CSS3", icon: SiCss3, ring: "ring-blue-500/50", category: "web" },
  { id: "react", label: "React", icon: SiReact, ring: "ring-sky-400/50", category: "web" },
  { id: "next", label: "Next.js", icon: SiNextdotjs, ring: "ring-black/50", category: "web" },
  { id: "tailwind", label: "Tailwind", icon: SiTailwindcss, ring: "ring-cyan-400/50", category: "web" },
  { id: "astro", label: "Astro", icon: SiAstro, ring: "ring-orange-400/50", category: "web" },

  // Sistemas / Virtualización
  { id: "linux", label: "Linux", icon: SiLinux, ring: "ring-yellow-400/50", category: "systems" },
  { id: "ubuntu", label: "Ubuntu", icon: SiUbuntu, ring: "ring-orange-600/50", category: "systems" },
  { id: "centos", label: "Centos", icon: SiCentos, ring: "ring-purple-400/50", category: "systems" },
  { id: "bash", label: "Bash", icon: SiGnubash, ring: "ring-green-600/50", category: "systems" },
  { id: "openstack", label: "OpenStack", icon: SiOpenstack, ring: "ring-rose-600/50", category: "systems" },
  { id: "kvm", label: "KVM / QEMU", icon: SiQemu, ring: "ring-orange-500/50", category: "systems" },

  // Robótica
  { id: "ros2", label: "ROS 2", icon: SiRos, ring: "ring-slate-800/50", category: "robotics" },
];
