export const drives = [
  { id: 'd1', name: 'Riverside Cleanup Day', org: 'EcoAction Club', date: 'Aug 2, 2026', hours: '3–5 hrs', desc: 'Join us clearing debris and invasive growth along the Riverside Trail ahead of the fall season.', spots: 24 },
  { id: 'd2', name: 'Weekend Literacy Tutoring', org: 'Bright Futures Tutoring', date: 'Ongoing Saturdays', hours: '2 hrs / week', desc: 'Support elementary readers at Jefferson Elementary with one-on-one and small-group sessions.', spots: 12 },
  { id: 'd3', name: 'Campus Blood Drive', org: 'Red Cross Student Chapter', date: 'Aug 9, 2026', hours: '1–2 hrs', desc: 'Help register donors, run refreshments, and staff check-in for our fall blood drive.', spots: 30 },
  { id: 'd4', name: 'Senior Center Tech Help', org: 'Digital Bridge Initiative', date: 'Aug 14, 2026', hours: '2 hrs', desc: 'Walk residents at Maple Grove Senior Living through smartphones, video calls, and email basics.', spots: 8 },
  { id: 'd5', name: 'Community Garden Build', org: 'Sprout Collective', date: 'Aug 16, 2026', hours: '4 hrs', desc: 'Build raised beds and prep soil for a new community garden plot on 5th Street.', spots: 20 },
  { id: 'd6', name: 'Food Pantry Sort & Pack', org: 'Westside Food Bank', date: 'Ongoing Sundays', hours: '3 hrs / week', desc: 'Sort donations and pack family boxes for weekly distribution at the Westside pantry.', spots: 15 }
];

export const submissions = [
  { id: 's1', drive: 'Weekend Literacy Tutoring', org: 'Bright Futures Tutoring', hours: 2, date: 'Jul 20, 2026', status: 'approved' },
  { id: 's2', drive: 'Campus Blood Drive', org: 'Red Cross Student Chapter', hours: 2, date: 'Jul 12, 2026', status: 'approved' },
  { id: 's3', drive: 'Community Garden Build', org: 'Sprout Collective', hours: 4, date: 'Jul 5, 2026', status: 'pending' },
  { id: 's4', drive: 'Food Pantry Sort & Pack', org: 'Westside Food Bank', hours: 3, date: 'Jun 28, 2026', status: 'rejected', reason: 'Hours exceed shift length on record — please resubmit with correct total.' },
  { id: 's5', drive: 'Riverside Cleanup Day', org: 'EcoAction Club', hours: 3, date: 'Jun 21, 2026', status: 'approved' }
];

export const queue = [
  { id: 'q1', student: 'Priya Nandakumar', drive: 'Community Garden Build', org: 'Sprout Collective', hours: 4, date: 'Jul 5, 2026' },
  { id: 'q2', student: 'Marcus Webb', drive: 'Senior Center Tech Help', org: 'Digital Bridge Initiative', hours: 2, date: 'Jul 14, 2026' },
  { id: 'q3', student: 'Elena Torres', drive: 'Campus Blood Drive', org: 'Red Cross Student Chapter', hours: 2, date: 'Jul 12, 2026' },
  { id: 'q4', student: 'Jordan Ashby', drive: 'Riverside Cleanup Day', org: 'EcoAction Club', hours: 5, date: 'Jul 2, 2026' },
  { id: 'q5', student: 'Sofia Reyes', drive: 'Weekend Literacy Tutoring', org: 'Bright Futures Tutoring', hours: 2, date: 'Jul 20, 2026' },
  { id: 'q6', student: 'Devon Okafor', drive: 'Food Pantry Sort & Pack', org: 'Westside Food Bank', hours: 3, date: 'Jul 19, 2026' }
];

export const leaderboard = [
  { rank: 1, name: 'Jordan Ashby', hours: 128, drives: 14, initials: 'JA' },
  { rank: 2, name: 'Priya Nandakumar', hours: 119, drives: 12, initials: 'PN' },
  { rank: 3, name: 'Sofia Reyes', hours: 104, drives: 11, initials: 'SR' },
  { rank: 4, name: 'Marcus Webb', hours: 92, drives: 9, initials: 'MW' },
  { rank: 5, name: 'Elena Torres', hours: 86, drives: 10, initials: 'ET' },
  { rank: 6, name: 'Devon Okafor', hours: 81, drives: 8, initials: 'DO' },
  { rank: 7, name: 'Amara Chukwu', hours: 74, drives: 7, initials: 'AC' },
  { rank: 8, name: 'Liam Fitzgerald', hours: 68, drives: 8, initials: 'LF' }
];
