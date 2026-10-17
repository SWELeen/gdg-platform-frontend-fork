export const phoneCountryCodeOptions = [
  { country: "Saudi Arabia", code: "+966" },
] as const;

export const defaultPhoneCountryCode = phoneCountryCodeOptions[0].code;

export const genderOptions = [
  { value: "female", labelKey: "female" },
  { value: "male", labelKey: "male" },
] as const;

export const universityOptions = [
  "University of Jeddah",
  "King Abdulaziz University",
  "University of Business and Technology (UBT)",
  "Dar Al-Hekma University",
  "Effat University",
  "Batterjee Medical College",
  "Ibn Sina National College",
  "Other",
] as const;

export const branchOptions = [
  "Main Campus Al-Faisaliyah (Female)",
  "Main Campus Asfan (Male)",
  "Khulais Branch (Female)",
  "Khulais Branch (Male)",
  "Other",
] as const;

export const collegeOptions = [
  "College of Information Technology",
  "College of Computer Science and Engineering",
  "College of Engineering",
  "College of Science",
  "College of Medicine",
  "College of Business",
  "College of Applied Medical Sciences",
  "College of Education",
  "College of Law and Judicial Studies",
  "College of Sport Sciences",
  "College of Communication and Media",
  "College of Languages and Translation",
  "College of Design and Arts",
  "College of Quran and Islamic Studies",
  "Other",
] as const;

export const majorOptions = [
  "Computer & Network Engineering",
  "Information Systems",
  "Computer Science",
  "Computer Engineering",
  "Software Engineering",
  "Information Technology",
  "Data Science",
  "Cybersecurity",
  "Artificial Intelligence",
  "Chemistry",
  "Industrial Chemistry",
  "Applied Biochemistry",
  "Biology",
  "Accounting",
  "Business Administration",
  "Supply Chain Management",
  "Finance",
  "Industrial Engineering",
  "Graphic Design",
  "Marketing",
  "Digital Media",
  "Human Resources",
  "Other",
] as const;

export const levelOptions = [
  "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6",
  "Level 7", "Level 8", "Level 9", "Level 10", "Level 11", "Level 12",
  "Graduated",
] as const;

export const committeeOptions = [
  "Project Management Committee",
  "Public Relations Committee",
  "Digital Media and Design Committee",
  "Content Writing Committee",
  "Artificial Intelligence Committee",
  "Data Analytics Committee",
  "Cybersecurity Committee",
  "Robotics Committee",
  "Automation Committee",
  "Web design and development",
] as const;

export const roleOptions = ["Leader", "Co-Leader", "Advisor", "Member"] as const;

export const eventRegistrationMembershipValues = ["yes", "no"] as const;
