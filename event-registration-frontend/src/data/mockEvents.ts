import type { Event, Registration } from '../types'

export const mockEvents: Event[] = [
  {
    id: 1,
    name: 'Tech Fest 2026',
    description:
      'Annual technical festival with coding contests, project exhibitions, and guest talks from alumni in industry.',
    date: '2026-10-15',
    time: '10:00 AM',
    venue: 'College Auditorium',
    capacity: 100,
    registeredCount: 28,
    category: 'Technical',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    name: 'Python Workshop',
    description:
      'Hands-on workshop covering Python basics, data handling, and a short mini-project for first and second year students.',
    date: '2026-10-22',
    time: '02:00 PM',
    venue: 'Lab 3, Computer Department',
    capacity: 40,
    registeredCount: 31,
    category: 'Workshop',
    image:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    name: 'Cultural Night',
    description:
      'An evening of music, dance, and drama performances organised by the cultural committee for the whole campus.',
    date: '2026-11-05',
    time: '05:30 PM',
    venue: 'Open Air Theatre',
    capacity: 200,
    registeredCount: 142,
    category: 'Cultural',
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    name: 'Inter-Department Cricket',
    description:
      'Friendly cricket matches between departments. Teams must register before the draw is published.',
    date: '2026-11-12',
    time: '08:00 AM',
    venue: 'College Sports Ground',
    capacity: 80,
    registeredCount: 80,
    category: 'Sports',
    image:
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    name: 'Career Guidance Seminar',
    description:
      'Seminar on internships, campus placements, and higher studies with faculty mentors and visiting recruiters.',
    date: '2026-10-28',
    time: '11:00 AM',
    venue: 'Seminar Hall A',
    capacity: 120,
    registeredCount: 54,
    category: 'Seminar',
    image:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    name: 'Campus Hackathon',
    description:
      '24-hour hackathon for teams of two to four. Build a campus-related prototype and present it to faculty judges.',
    date: '2026-11-20',
    time: '09:00 AM',
    venue: 'Innovation Lab',
    capacity: 60,
    registeredCount: 22,
    category: 'Technical',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 7,
    name: 'Web Development Workshop',
    description:
      'Introductory workshop on HTML, CSS, and React components. Bring a laptop. Certificates issued on attendance.',
    date: '2026-11-08',
    time: '01:00 PM',
    venue: 'Lab 1, IT Department',
    capacity: 35,
    registeredCount: 18,
    category: 'Workshop',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 8,
    name: 'Debate Championship',
    description:
      'Inter-year debate on current affairs and campus issues. Preliminary rounds in the morning, finals in the evening.',
    date: '2026-11-18',
    time: '10:30 AM',
    venue: 'Language Lab',
    capacity: 50,
    registeredCount: 16,
    category: 'Cultural',
    image:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  },
]

export const mockRegistrations: Registration[] = [
  {
    id: 1,
    eventId: 1,
    name: 'Soham Palkar',
    email: 'soham@gmail.com',
    studentId: 'TE30',
    registeredAt: '2026-09-20T10:15:00Z',
  },
  {
    id: 2,
    eventId: 2,
    name: 'Rahul Deshmukh',
    email: 'rahul@college.edu',
    studentId: 'TE12',
    registeredAt: '2026-09-21T14:40:00Z',
  },
  {
    id: 3,
    eventId: 3,
    name: 'Ananya Kulkarni',
    email: 'ananya.k@college.edu',
    studentId: 'SE08',
    registeredAt: '2026-09-22T09:05:00Z',
  },
  {
    id: 4,
    eventId: 5,
    name: 'Meera Joshi',
    email: 'meera.j@college.edu',
    studentId: 'BE21',
    registeredAt: '2026-09-23T16:20:00Z',
  },
]
