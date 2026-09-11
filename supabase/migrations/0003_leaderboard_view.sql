-- Leaderboard is computed on read from approved hour_logs rather than a
-- denormalized column -- cheap at this scale and always correct.

create view leaderboard as
select
  p.id as student_id,
  p.name,
  p.initials,
  coalesce(sum(hl.hours) filter (where hl.status = 'approved'), 0) as hours,
  count(hl.id) filter (where hl.status = 'approved') as drives,
  rank() over (
    order by coalesce(sum(hl.hours) filter (where hl.status = 'approved'), 0) desc
  ) as rank
from profiles p
left join hour_logs hl on hl.student_id = p.id
where p.role = 'volunteer'
group by p.id, p.name, p.initials
order by hours desc, p.name asc;

-- Public read: the Landing page shows a top-3 preview before login.
grant select on leaderboard to anon, authenticated;
