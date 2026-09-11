-- Landing page hero numbers (total verified hours, participating volunteers,
-- active drives). security definer because these are site-wide totals across
-- all volunteers' hour_logs, not just the caller's own RLS-visible rows.
create function public.get_stats()
returns table (hours numeric, students bigint, drives bigint)
language sql
security definer
stable
set search_path = public
as $$
  select
    coalesce((select sum(hl.hours) from hour_logs hl where hl.status = 'approved'), 0) as hours,
    (select count(distinct hl.student_id) from hour_logs hl where hl.status = 'approved') as students,
    (select count(*) from drives) as drives;
$$;

grant execute on function public.get_stats() to anon, authenticated;
