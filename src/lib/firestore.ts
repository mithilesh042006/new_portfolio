import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc, setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Project {
  id?: string;
  title: string;
  description: string;
  tech: string[];
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  year: number;
  category: string;
  order?: number;
}

export interface Experience {
  id?: string;
  role: string;
  company: string;
  period: string;
  description: string;
  order: number;
}

export interface Qualification {
  id?: string;
  title: string;
  institution: string;
  year: string;
  description: string;
  iconName: string;
  order: number;
}

export interface Testimonial {
  id?: string;
  quote: string;
  author: string;
  role: string;
}

export interface GalleryImage {
  id?: string;
  url: string;
  alt: string;
  order?: number;
}

export interface About {
  name: string;
  bio: string;
  email: string;
  socials: {
    github: string;
    linkedin: string;
    twitter: string;
    instagram: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const colRef = (name: string) => collection(db, name);
const docRef = (colName: string, id: string) => doc(db, colName, id);

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const snap = await getDocs(colRef('projects'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
}

export function watchProjects(cb: (projects: Project[]) => void) {
  return onSnapshot(colRef('projects'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)))
  );
}

export async function addProject(data: Omit<Project, 'id'>) {
  return addDoc(colRef('projects'), data);
}

export async function updateProject(id: string, data: Partial<Project>) {
  return updateDoc(docRef('projects', id), data);
}

export async function deleteProject(id: string) {
  return deleteDoc(docRef('projects', id));
}

// ─── Experience ───────────────────────────────────────────────────────────────

export async function getExperiences(): Promise<Experience[]> {
  const snap = await getDocs(colRef('experiences'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Experience));
}

export function watchExperiences(cb: (list: Experience[]) => void) {
  return onSnapshot(colRef('experiences'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Experience)))
  );
}

export async function addExperience(data: Omit<Experience, 'id'>) {
  return addDoc(colRef('experiences'), data);
}

export async function updateExperience(id: string, data: Partial<Experience>) {
  return updateDoc(docRef('experiences', id), data);
}

export async function deleteExperience(id: string) {
  return deleteDoc(docRef('experiences', id));
}

// ─── Qualifications ───────────────────────────────────────────────────────────

export async function getQualifications(): Promise<Qualification[]> {
  const snap = await getDocs(colRef('qualifications'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Qualification));
}

export function watchQualifications(cb: (list: Qualification[]) => void) {
  return onSnapshot(colRef('qualifications'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Qualification)))
  );
}

export async function addQualification(data: Omit<Qualification, 'id'>) {
  return addDoc(colRef('qualifications'), data);
}

export async function updateQualification(id: string, data: Partial<Qualification>) {
  return updateDoc(docRef('qualifications', id), data);
}

export async function deleteQualification(id: string) {
  return deleteDoc(docRef('qualifications', id));
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function getTestimonials(): Promise<Testimonial[]> {
  const snap = await getDocs(colRef('testimonials'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial));
}

export function watchTestimonials(cb: (list: Testimonial[]) => void) {
  return onSnapshot(colRef('testimonials'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial)))
  );
}

export async function addTestimonial(data: Omit<Testimonial, 'id'>) {
  return addDoc(colRef('testimonials'), data);
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>) {
  return updateDoc(docRef('testimonials', id), data);
}

export async function deleteTestimonial(id: string) {
  return deleteDoc(docRef('testimonials', id));
}

// ─── Gallery Images ───────────────────────────────────────────────────────────

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const snap = await getDocs(colRef('gallery_images'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImage));
}

export function watchGalleryImages(cb: (list: GalleryImage[]) => void) {
  return onSnapshot(colRef('gallery_images'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImage)))
  );
}

export async function addGalleryImage(data: Omit<GalleryImage, 'id'>) {
  return addDoc(colRef('gallery_images'), data);
}

export async function deleteGalleryImage(id: string) {
  return deleteDoc(docRef('gallery_images', id));
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export interface Skill {
  id?: string;
  name: string;
  iconUrl: string;
  category: string;
  order: number;
}

export async function getSkills(): Promise<Skill[]> {
  const snap = await getDocs(colRef('skills'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Skill));
}

export function watchSkills(cb: (list: Skill[]) => void) {
  return onSnapshot(colRef('skills'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Skill)))
  );
}

export async function addSkill(data: Omit<Skill, 'id'>) {
  return addDoc(colRef('skills'), data);
}

export async function updateSkill(id: string, data: Partial<Skill>) {
  return updateDoc(docRef('skills', id), data);
}

export async function deleteSkill(id: string) {
  return deleteDoc(docRef('skills', id));
}

// ─── Messages (Contact Form) ─────────────────────────────────────────────────

export interface Message {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export async function getMessages(): Promise<Message[]> {
  const snap = await getDocs(colRef('messages'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
}

export function watchMessages(cb: (list: Message[]) => void) {
  return onSnapshot(colRef('messages'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)))
  );
}

export async function addMessage(data: Omit<Message, 'id'>) {
  return addDoc(colRef('messages'), data);
}

export async function updateMessage(id: string, data: Partial<Message>) {
  return updateDoc(docRef('messages', id), data);
}

export async function deleteMessage(id: string) {
  return deleteDoc(docRef('messages', id));
}

// ─── About ────────────────────────────────────────────────────────────────────

export async function getAbout(): Promise<About | null> {
  const snap = await getDoc(doc(db, 'about', 'main'));
  return snap.exists() ? (snap.data() as About) : null;
}

export function watchAbout(cb: (about: About) => void) {
  return onSnapshot(doc(db, 'about', 'main'), snap => {
    if (snap.exists()) cb(snap.data() as About);
  });
}

export async function setAbout(data: About) {
  return setDoc(doc(db, 'about', 'main'), data);
}

// ─── AI context fetch ─────────────────────────────────────────────────────────

export async function fetchAiContext(): Promise<string> {
  const [projects, experiences, qualifications, about] = await Promise.all([
    getProjects(),
    getExperiences(),
    getQualifications(),
    getAbout(),
  ]);

  const lines: string[] = [];

  if (about) {
    lines.push(`Name: ${about.name}`);
    lines.push(`Bio: ${about.bio}`);
    lines.push(`Email: ${about.email}`);
  }

  lines.push('\n## Projects');
  projects.forEach(p => {
    lines.push(`- ${p.title} (${p.year}): ${p.description}. Tech: ${p.tech.join(', ')}`);
  });

  lines.push('\n## Experiences');
  experiences.forEach(e => {
    lines.push(`- ${e.role} at ${e.company} (${e.period}): ${e.description}`);
  });

  lines.push('\n## Education & Certifications');
  qualifications.forEach(q => {
    lines.push(`- ${q.title} at ${q.institution} (${q.year}): ${q.description}`);
  });

  return lines.join('\n');
}
