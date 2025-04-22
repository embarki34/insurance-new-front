export interface Value {
  key: string
  label: string
  linked_params: any[]
}


export interface Parameter {
  id: string
  key: string
  label: string
  values: Value[]
}







export interface Case {
  id: string
  title: string
  description: string
  case_type: string
  status: string
  pre_litigation_ids: any[]
  litigation_ids: any[]
  box_number: string
  file_number: string
  file_status: string
  file_type: string
  registration_year: number
  plaintiff: string
  defendant: string
  dispute_subject: string
  created_at: string
  updated_at: string
  createdBy: string

}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}


export interface caseEndpointResponse {
  cases: Case[]
  pagination: Pagination
}



export interface caseInput {
  title: string
  description: string
  case_type: string
  status: string
  box_number: string
  file_number: string
  registration_year: number
  plaintiff: string
  defendant: string
  dispute_subject: string
  updatedBy: string
}





export interface courtInput {
  _id?: string
  case_id: string
  court: string
  court_type: string
  litigation_lvl: number
  index_number: string
  court_case_number: string
  date_sent_to_lawyer: Date | null
  judgment_date: Date
  judgment_summary: string
  notes: string
  hearing_date: Date | null
}
export interface judicialCouncilInput {
  _id?: string
  case_id: string
  court: string
  court_type: string
  litigation_lvl: number
  index_number: string
  court_case_number: string
  judgment_date: Date
  judgment_summary: string
  notes: string
  hearing_date: Date | null
}





export interface eventInput {

  title: string
  notes: string
  emails: string[]
  case_lvl: number
  notification_date: Date

}

export interface PreLitigationInput {
  case_id: string
  type_of_action: string
  sender: string
  receiver: string
  address: string
  // state: string
  date_sent_to_lawyer: Date
  judicial_officer: string
  notes_or_taken_actions: string
  warning_delivery_date: Date
  warning_expiration_date: Date
  response_method: string
  createdby: string
  // receive_notifications: boolean
  event: eventInput
}


export interface CourtInput {
  case_id: string;
  court: string;
  court_type: string;
  litigation_lvl: number;
  index_number: string;
  court_case_number: string;
  judgment_date: string;
  judgment_summary: string;
  notes: string;
}


export interface court_dates{
  date: string;
  note: string;
  _id: string;
}



export interface PreLitigation {
  _id: string;
  case_id: string;
  type_of_action: string;
  sender: string;
  receiver: string;
  address: string;
  date_sent_to_lawyer: string;
  judicial_officer: string;
  notes_or_taken_actions: string;
  warning_delivery_date: string;
  warning_expiration_date: string;
  response_method: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  court_dates: court_dates[];
}
export interface event {
  _id: string;
  case_id: string;
  title: string;
  emails: string[];
  notification_date: Date;
  case_lvl: number;
  date: string;
  notes: string;
}
export interface caseByIdResponse {
  id: string;
  title: string;
  description: string;
  case_type: string;
  status: string;
  pre_litigations: PreLitigation[];
  litigations: Litigation[];
  litigations_lv1: Litigation[];
  litigations_lv2: Litigation[];
  events: event[];
  box_number: string;
  file_number: string;
  registration_year: number;
  plaintiff: string;
  defendant: string;
  dispute_subject: string;
}



export interface Litigation {
  _id: string;
  case_id: string;
  court: string;
  court_type: string;
  litigation_lvl: number;
  index_number: string;
  court_case_number: string;
  judgment_date: string; // Changed from Date to string
  judgment_summary: string;
  notes: string;
  date_sent_to_lawyer: string;
  createdAt: string;
  updatedAt: string;
}






