
import { ContactStatus } from "@/types/surgeon";

export const COUNTRIES = [
  { value: "US", label: "USA" },
  { value: "Turkey", label: "Turkey" },
  { value: "Canada", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "Germany", label: "Germany" },
  { value: "Spain", label: "Spain" },
  { value: "Mexico", label: "Mexico" },
  { value: "Brazil", label: "Brazil" },
  { value: "India", label: "India" },
  { value: "Thailand", label: "Thailand" },
  { value: "South Korea", label: "South Korea" },
];

export const USA_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export const CONTACT_STATUS_OPTIONS = Object.values(ContactStatus).map(status => ({
  value: status,
  label: status.replace(/([A-Z])/g, ' $1').trim(), 
}));

export const RATING_OPTIONS = [
  { value: 1, label: "1 Star" },
  { value: 2, label: "2 Stars" },
  { value: 3, label: "3 Stars" },
  { value: 4, label: "4 Stars" },
  { value: 5, label: "5 Stars" },
];

export const SORT_OPTIONS = [
  { value: "name_asc", label: "Name: A-Z" },
  { value: "name_desc", label: "Name: Z-A" },
  { value: "favorites_first", label: "Favorites First" }, 
  { value: "reviews_high_low", label: "Reviews: High to Low" },
  { value: "rating_high_low", label: "Rating: High to Low" },
  { value: "cost_low_high", label: "Cost: Low to High" },
  { value: "cost_high_low", label: "Cost: High to Low" },
  { value: "country_asc", label: "Country: A-Z" },
  { value: "country_desc", label: "Country: Z-A" },
  { value: "state_asc", label: "State (US): A-Z" },
  { value: "state_desc", label: "State (US): Z-A" },
  { value: "status_asc", label: "Status: A-Z" },
  { value: "status_desc", label: "Status: Z-A" },
];

export const SUMMARY_LENGTH_OPTIONS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

export const getStatusColor = (status: ContactStatus): string => {
  switch (status) {
    case ContactStatus.None:
      return "bg-status-none-bg text-status-none-text border-status-none-border";
    case ContactStatus.Contacted:
      return "bg-status-contacted-bg text-status-contacted-text border-status-contacted-border";
    case ContactStatus.Responded:
      return "bg-status-responded-bg text-status-responded-text border-status-responded-border";
    case ContactStatus.PriceGiven:
      return "bg-status-pricegiven-bg text-status-pricegiven-text border-status-pricegiven-border";
    case ContactStatus.ConsultDone:
      return "bg-status-consultdone-bg text-status-consultdone-text border-status-consultdone-border";
    case ContactStatus.Archived:
      return "bg-status-archived-bg text-status-archived-text border-status-archived-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const getStatusIconColor = (status: ContactStatus): string => {
  switch (status) {
    case ContactStatus.None:
      return "text-status-none-text";
    case ContactStatus.Contacted:
      return "text-status-contacted-text";
    case ContactStatus.Responded:
      return "text-status-responded-text";
    case ContactStatus.PriceGiven:
      return "text-status-pricegiven-text";
    case ContactStatus.ConsultDone:
      return "text-status-consultdone-text";
    case ContactStatus.Archived:
      return "text-status-archived-text";
    default:
      return "text-muted-foreground";
  }
};
