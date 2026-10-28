-- Public IDs and quiz keys only; update alongside backend/curriculum.py.
begin;
insert into public.ap_lessons(id,position,answer) values
('l01',1,1),('l02',2,1),('l03',3,0),('l04',4,1),('l05',5,2),
('l06',6,0),('l07',7,2),('l08',8,1),('l09',9,1),('l10',10,1),
('l11',11,1),('l12',12,0),('l13',13,1),('l14',14,0),('l15',15,1),
('l16',16,1),('l17',17,1),('l18',18,1),('l19',19,1),('l20',20,0),
('l21',21,1),('l22',22,1),('l23',23,1),('l24',24,1),('l25',25,1),
('lc01',26,1),('lc02',27,1),('lc03',28,1),('lc04',29,1),
('l26',30,1),('l27',31,1),('l28',32,1),('l29',33,1),('l30',34,1),
('l31',35,1),('lg01',36,1),('lg02',37,1),('lg03',38,1),('lg04',39,1),
('l32',40,1),('l33',41,1),('l34',42,1),('l35',43,1),
('l36',44,1),('l37',45,1),('l38',46,1),('l39',47,1),('l40',48,1)
on conflict(id) do update set position = excluded.position, answer = excluded.answer;
insert into public.ap_projects(id) values ('p1'),('p2'),('p3'),('p4') on conflict do nothing;
commit;
