create type public.app_role as enum ('owner', 'student');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.raw_user_meta_data->>'phone');
  insert into public.user_roles (user_id, role)
  values (new.id, coalesce((new.raw_user_meta_data->>'role')::app_role, 'student'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create table public.messes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating numeric not null default 4.0,
  distance_km numeric not null default 1,
  price_month integer not null,
  address text not null default '',
  phone text not null default '',
  timings text not null default '',
  about text not null default '',
  features text[] not null default '{}',
  image_key text not null default 'mess-shree',
  created_at timestamptz not null default now()
);
grant select on public.messes to anon;
grant select on public.messes to authenticated;
grant all on public.messes to service_role;
alter table public.messes enable row level security;
create policy "Anyone can read messes" on public.messes for select to anon, authenticated using (true);

insert into public.messes (name, rating, distance_km, price_month, address, phone, timings, about, features, image_key) values
('Didi ki Rasoi', 4.5, 0.6, 3200, 'Morar, Gwalior, Madhya Pradesh', '+91 94251 38472', 'Lunch 12:00 – 2:30 PM · Dinner 7:00 – 10:00 PM', 'Homely ghar-jaisa khana cooked fresh daily — dal, sabzi, roti and rice with a special Sunday thali.', array['Pure veg','Home-style cooking','Sunday special','UPI accepted'], 'mess-shree'),
('Bawarchi', 4.0, 1.1, 2800, 'Bank Colony, Morar, Gwalior, Madhya Pradesh 474005', '+91 98930 45621', 'Lunch 12:00 – 2:30 PM · Dinner 7:00 – 10:00 PM', 'Budget-friendly mess with a rotating weekly menu of North Indian meals, popular with students in Bank Colony.', array['Veg & non-veg','Weekly menu','Tiffin service','Evening snacks'], 'mess-campus');

create table public.menu_days (
  id uuid primary key default gen_random_uuid(),
  week_index integer not null,
  day_of_week integer not null,
  theme text not null default '',
  breakfast text not null default '',
  lunch text not null default '',
  snacks text not null default '',
  dinner text not null default '',
  unique (week_index, day_of_week)
);
grant select on public.menu_days to authenticated;
grant update on public.menu_days to authenticated;
grant all on public.menu_days to service_role;
alter table public.menu_days enable row level security;
create policy "Signed-in users read menu" on public.menu_days for select to authenticated using (true);
create policy "Owners update menu" on public.menu_days for update to authenticated using (public.has_role(auth.uid(), 'owner')) with check (public.has_role(auth.uid(), 'owner'));

insert into public.menu_days (week_index, day_of_week, theme, breakfast, lunch, dinner, snacks) values
(0,0,'North Indian week','Poha + Jalebi + Tea','Dal Tadka + Jeera Rice + Roti + Salad','Paneer Butter Masala + Roti','Banana'),
(0,1,'North Indian week','Aloo Paratha + Curd','Rajma + Rice + Roti','Mix Veg + Dal + Roti','Boiled Chana'),
(0,2,'North Indian week','Idli + Sambar + Chutney','Kadhi Pakoda + Rice + Roti','Chole + Bhature','Sprouts Chaat'),
(0,3,'North Indian week','Upma + Tea','Dal Makhani + Rice + Roti','Aloo Gobi + Roti + Kheer','Samosa + Tea'),
(0,4,'North Indian week','Bread Omelette / Veg Sandwich','Chole + Rice + Roti','Veg Biryani + Raita','Fruit Bowl'),
(0,5,'North Indian week','Methi Thepla + Pickle','Sambar Rice + Papad','Paneer Bhurji + Roti','Bhel Puri'),
(0,6,'North Indian week','Chole Kulche','Special Thali + Gulab Jamun','Light Khichdi + Kadhi','Masala Chai + Biscuits'),
(1,0,'South Indian week','Masala Dosa + Chutney','Sambar + Rice + Poriyal','Tomato Rice + Curd','Banana'),
(1,1,'South Indian week','Pongal + Vada','Rasam Rice + Beans Fry','Chapati + Veg Kurma','Sundal'),
(1,2,'South Indian week','Rava Idli + Chutney','Curd Rice + Pickle + Papad','Lemon Rice + Dal','Murukku + Tea'),
(1,3,'South Indian week','Uttapam + Sambar','Bisi Bele Bath + Raita','Paratha + Paneer Curry','Fruit Bowl'),
(1,4,'South Indian week','Poha + Tea','Veg Pulao + Dal Fry','Appam + Veg Stew','Corn Chaat'),
(1,5,'South Indian week','Medu Vada + Sambar','Lemon Rice + Rasam','Chole + Roti','Mirchi Bajji'),
(1,6,'South Indian week','Aloo Puri','Festive Thali + Payasam','Dal Khichdi + Papad','Coffee + Rusk'),
(2,0,'Protein-rich week','Moong Chilla + Chutney','Rajma + Brown Rice + Salad','Soya Chunk Curry + Roti','Roasted Peanuts'),
(2,1,'Protein-rich week','Besan Chilla + Curd','Chana Dal + Rice + Roti','Paneer Tikka Masala + Roti','Sprouts Salad'),
(2,2,'Protein-rich week','Oats Upma + Milk','Masoor Dal + Rice + Roti','Matar Paneer + Pulao','Boiled Eggs / Chana'),
(2,3,'Protein-rich week','Paneer Paratha + Curd','Lobia Curry + Rice','Mix Dal + Jeera Rice','Makhana'),
(2,4,'Protein-rich week','Egg Bhurji / Tofu Scramble + Toast','Chole + Rice + Roti','Veg Biryani + Raita','Fruit Custard'),
(2,5,'Protein-rich week','Idli + Sambar','Kadhi + Rice + Roti','Palak Paneer + Roti','Chana Chaat'),
(2,6,'Protein-rich week','Poha + Milk','Special Thali + Rasmalai','Moong Dal Khichdi','Lassi'),
(3,0,'Home-style week','Aloo Paratha + Butter','Dal Fry + Rice + Bhindi','Kadai Paneer + Roti','Banana'),
(3,1,'Home-style week','Poha + Tea','Rajma Chawal + Salad','Lauki Chana + Roti','Namak Pare'),
(3,2,'Home-style week','Vermicelli Upma','Dal + Rice + Aloo Jeera','Chole + Roti + Halwa','Fruit Bowl'),
(3,3,'Home-style week','Idli + Sambar','Kadhi Chawal + Papad','Mix Veg + Dal + Roti','Dhokla'),
(3,4,'Home-style week','Stuffed Paratha + Curd','Chole + Rice + Roti','Veg Fried Rice + Manchurian','Pav Bhaji'),
(3,5,'Home-style week','Bread Butter + Tea','Sambar Rice + Poriyal','Paneer Do Pyaza + Roti','Pakode + Tea'),
(3,6,'Home-style week','Puri Bhaji','Special Thali + Ice Cream','Khichdi + Kadhi','Masala Chai');

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  meal text not null,
  opted boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, date, meal)
);
grant select, insert, update, delete on public.attendance to authenticated;
grant all on public.attendance to service_role;
alter table public.attendance enable row level security;
create policy "Users manage own attendance" on public.attendance for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owners read all attendance" on public.attendance for select to authenticated using (public.has_role(auth.uid(), 'owner'));

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  service text not null default 'Mess',
  rating integer not null default 5,
  message text not null,
  status text not null default 'Submitted',
  created_at timestamptz not null default now()
);
grant select, insert on public.feedback to authenticated;
grant all on public.feedback to service_role;
alter table public.feedback enable row level security;
create policy "Users submit own feedback" on public.feedback for insert to authenticated with check (auth.uid() = user_id);
create policy "Users read own feedback" on public.feedback for select to authenticated using (auth.uid() = user_id);
create policy "Owners read all feedback" on public.feedback for select to authenticated using (public.has_role(auth.uid(), 'owner'));