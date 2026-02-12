export interface Organization {
  organization_id?: number;
  organization_name: string;
  owner_user_id: number;
  organization_type: 'company' | 'clinic' | 'personal';
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// דוגמה לשימוש:
// const org: Organization = {
//   organization_name: 'שם ארגון',
//   owner_user_id: 123,
//   organization_type: 'company',
//   contact_name: 'שם איש קשר',
//   contact_phone: '050-1234567',
//   contact_email: 'email@example.com',
//   status: 'active'
// };
