import type { Surgeon } from '@/types/surgeon';
import { ContactStatus } from '@/types/surgeon';

export const initialSurgeons: Surgeon[] = [
  {
    id: '1',
    name: 'Dr. John Doe',
    clinicName: ' américains ',
    location: { country: 'USA', state: 'CA', city: 'Los Angeles' },
    specialties: ['FUE', 'FUT', 'Robotic Hair Restoration'],
    publicReviews: [{ source: 'Google', rating: 4.8, count: 150, link: '#' }],
    contactStatus: ContactStatus.None,
    isPriceGiven: false,
    isConsultDone: false,
    contactInfo: {
      email: 'dr.doe@example.com',
      website: 'https://drdoeclinic.com',
      consultLink: 'https://drdoeclinic.com/consult',
    },
    socialMedia: { instagram: 'drdoehair', youtube: 'drdoechannel' },
    profileImageUrl: 'https://placehold.co/100x100.png',
    notes: 'Initial notes about Dr. Doe. Heard good things about his FUE technique.'
  },
  {
    id: '2',
    name: 'Dr. Jane Smith',
    clinicName: 'Beverly Hills Hair Group',
    location: { country: 'USA', state: 'CA', city: 'Beverly Hills' },
    specialties: ['Female Hair Transplants', 'FUE'],
    publicReviews: [{ source: 'Realself', rating: 4.9, count: 200, link: '#' }],
    contactStatus: ContactStatus.Contacted,
    outreachDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    isPriceGiven: false,
    isConsultDone: false,
    contactInfo: {
      email: 'dr.smith@example.com',
      phone: '+1-555-0101',
      website: 'https://bhairgroup.com',
    },
    socialMedia: { facebook: 'bhairgroup' },
    profileImageUrl: 'https://placehold.co/100x100.png',
    notes: 'Contacted Dr. Smith for a consultation. Awaiting response.'
  },
  {
    id: '3',
    name: 'Dr. Ahmet Yilmaz',
    clinicName: 'Istanbul Hair Clinic',
    location: { country: 'Turkey', city: 'Istanbul' },
    specialties: ['Mega Sessions', 'DHI', 'FUE'],
    publicReviews: [{ source: 'Trustpilot', rating: 4.7, count: 500, link: '#' }],
    contactStatus: ContactStatus.Responded,
    outreachDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    responseDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    isPriceGiven: true,
    costEstimate: '€3000 - €4500',
    isConsultDone: false,
    contactInfo: { website: 'https://istanbulhair.com.tr' },
    socialMedia: {},
    profileImageUrl: 'https://placehold.co/100x100.png',
    notes: 'Responded quickly. Price seems reasonable. Considering scheduling a consult.'
  },
  {
    id: '4',
    name: 'Dr. Emily White',
    clinicName: 'NY Hair Institute',
    location: { country: 'USA', state: 'NY', city: 'New York' },
    specialties: ['FUT', 'Corrective Hair Surgery'],
    publicReviews: [{ source: 'Yelp', rating: 4.5, count: 90, link: '#' }],
    contactStatus: ContactStatus.ConsultDone,
    outreachDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    responseDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    isPriceGiven: true,
    actualCost: '$8000',
    isConsultDone: true,
    personalRating: 5,
    contactInfo: { email: 'info@nyhair.com' },
    socialMedia: { instagram: 'nyhairinstitute' },
    profileImageUrl: 'https://placehold.co/100x100.png',
    notes: 'Consult was very informative. Dr. White is highly experienced. Final cost provided.'
  },
  {
    id: '5',
    name: 'Dr. Mehmet Ozcan',
    clinicName: 'Ankara Hair Center',
    location: { country: 'Turkey', city: 'Ankara' },
    specialties: ['Sapphire FUE', 'Beard Transplant'],
    publicReviews: [{ source: 'Google', rating: 4.9, count: 350, link: '#' }],
    contactStatus: ContactStatus.PriceGiven,
    outreachDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    responseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isPriceGiven: true,
    costEstimate: '€2500 for 3000 grafts',
    isConsultDone: false,
    contactInfo: { website: 'https://ankarahaircenter.com' },
    socialMedia: {},
    profileImageUrl: 'https://placehold.co/100x100.png',
    notes: 'Received price quote. Still evaluating options in Turkey.'
  }
];

export const generateNewSurgeonId = (): string => `surgeon_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`;