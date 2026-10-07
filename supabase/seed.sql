-- OPCIONAL: exemplos identificados. Não contém usuários, permissões ou dados de saúde.
-- Execute manualmente só se quiser visualizar conteúdo ilustrativo no ambiente Supabase.
insert into public.protocols(id,product_id,name,published,is_demo)
values('10000000-0000-4000-8000-000000000001','testomax','Rotina de demonstração',true,true) on conflict do nothing;
insert into public.program_phases(id,protocol_id,name,description,position) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Construir a base','Encontre os horários que funcionam para você.',1),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','Criar consistência','Registre suas atividades e ajuste sua organização.',2),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','Sua rotina, seu ritmo','Revise suas preferências para seguir com autonomia.',3) on conflict do nothing;

insert into public.activity_templates(id,protocol_id,category,schedule,time_preference,content) values
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','bem-estar','daily','wakeTime','{"title":"Um momento ao ar livre","subtitle":"Comece o dia com uma pausa para você","icon":"sun","time":"07:00","minutes":10,"editable":true,"instructions":["Reserve um momento para apreciar um espaço aberto.","Exemplo de organização de hábito. Adapte à sua rotina e às condições do ambiente."],"exercises":[]}'),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','movimento','training',null,'{"title":"Seu momento de movimento","subtitle":"Reserve tempo para sua atividade","icon":"dumbbell","time":"08:00","minutes":30,"editable":true,"instructions":["Este conteúdo é uma demonstração da organização de uma rotina, não uma prescrição de treino.","Utilize os exercícios e orientações cadastrados pelo profissional que acompanha você."],"exercises":[]}'),
('30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','bem-estar','daily',null,'{"title":"Pausa para se hidratar","subtitle":"Um lembrete no meio da rotina","icon":"droplet","time":"10:00","minutes":2,"editable":true,"instructions":["Faça uma pausa e registre seu momento de hidratação.","Este lembrete não define uma meta individual de ingestão de água."],"exercises":[]}'),
('30000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','bem-estar','daily',null,'{"title":"Leitura e aprendizado","subtitle":"Algumas páginas, uma nova perspectiva","icon":"book","time":"19:00","minutes":15,"editable":true,"instructions":["Escolha uma leitura de seu interesse.","Reserve um intervalo sem distrações e registre ao terminar."],"exercises":[]}'),
('30000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','sono','daily','sleepTime','{"title":"Preparar para descansar","subtitle":"Desacelere no fim do dia","icon":"moon","time":"22:00","minutes":15,"editable":true,"instructions":["Organize o ambiente e anote as tarefas de amanhã.","Este exemplo não substitui acompanhamento para dificuldades de sono."],"exercises":[]}') on conflict do nothing;

insert into public.meal_templates(id,protocol_id,diets,content) values
('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',array['variada','vegetariana'],'{"title":"Café da manhã","description":"Iogurte com aveia e frutas","time":"07:30","image":"/images/breakfast.jpg","nutrition":null,"steps":["Coloque o iogurte em uma tigela.","Acrescente a aveia e a banana cortada."],"substitutions":["Neste exemplo, a banana pode ser trocada por 1 maçã."]}'),
('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001',array['variada'],'{"title":"Almoço","description":"Frango, arroz e vegetais","time":"12:30","image":"/images/lunch.jpg","nutrition":null,"steps":["Cozinhe o arroz conforme a embalagem.","Prepare o frango até estar completamente cozido e cozinhe os vegetais.","Sirva os ingredientes juntos. As quantidades são ilustrativas."],"substitutions":["Opção vegetariana: tofu (150 g), cadastrada separadamente."]}'),
('40000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001',array['variada','vegetariana'],'{"title":"Lanche da tarde","description":"Frutas e castanhas","time":"16:00","image":"/images/snack.jpg","nutrition":null,"steps":["Lave a fruta e separe as castanhas."],"substitutions":[]}'),
('40000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001',array['variada','vegetariana'],'{"title":"Jantar","description":"Bowl de grão-de-bico e vegetais","time":"19:30","image":"/images/dinner.jpg","nutrition":null,"steps":["Prepare e higienize os vegetais.","Misture com o grão-de-bico já cozido."],"substitutions":[]}'),
('40000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001',array['vegetariana'],'{"title":"Almoço","description":"Tofu, arroz e vegetais","time":"12:30","image":"/images/dinner.jpg","nutrition":null,"steps":["Cozinhe o arroz conforme a embalagem.","Prepare o tofu e os vegetais."],"substitutions":[]}') on conflict do nothing;

insert into public.ingredients(id,name,category) values
('50000000-0000-4000-8000-000000000001','Iogurte natural','Laticínios'),
('50000000-0000-4000-8000-000000000002','Aveia','Grãos e cereais'),
('50000000-0000-4000-8000-000000000003','Banana','Frutas'),
('50000000-0000-4000-8000-000000000004','Peito de frango','Proteínas'),
('50000000-0000-4000-8000-000000000005','Arroz integral','Grãos e cereais'),
('50000000-0000-4000-8000-000000000006','Brócolis','Vegetais'),
('50000000-0000-4000-8000-000000000007','Maçã','Frutas'),
('50000000-0000-4000-8000-000000000008','Castanhas','Grãos e cereais'),
('50000000-0000-4000-8000-000000000009','Grão-de-bico cozido','Grãos e cereais'),
('50000000-0000-4000-8000-000000000010','Tomate','Vegetais'),
('50000000-0000-4000-8000-000000000011','Tofu','Proteínas') on conflict do nothing;
insert into public.meal_ingredients(meal_template_id,ingredient_id,quantity,unit) values
('40000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001',170,'g'),
('40000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000002',30,'g'),
('40000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000003',1,'un'),
('40000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000004',150,'g'),
('40000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000005',60,'g'),
('40000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000006',100,'g'),
('40000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000007',1,'un'),
('40000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000008',20,'g'),
('40000000-0000-4000-8000-000000000004','50000000-0000-4000-8000-000000000009',120,'g'),
('40000000-0000-4000-8000-000000000004','50000000-0000-4000-8000-000000000006',100,'g'),
('40000000-0000-4000-8000-000000000004','50000000-0000-4000-8000-000000000010',1,'un'),
('40000000-0000-4000-8000-000000000005','50000000-0000-4000-8000-000000000011',150,'g'),
('40000000-0000-4000-8000-000000000005','50000000-0000-4000-8000-000000000005',60,'g'),
('40000000-0000-4000-8000-000000000005','50000000-0000-4000-8000-000000000006',100,'g') on conflict do nothing;

-- Objetivo e experiência selecionam variantes cadastradas; nenhuma geração clínica.
update public.activity_templates set goals=array['consistencia','forca'] where id='30000000-0000-4000-8000-000000000004';
update public.activity_templates set experiences=array['intermediario','avancado'] where id='30000000-0000-4000-8000-000000000002';
insert into public.activity_templates(id,protocol_id,category,schedule,goals,content) values
('30000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000001','bem-estar','daily',array['energia'],'{"title":"Uma pausa para você","subtitle":"Deixe um espaço livre no dia","icon":"book","time":"19:00","minutes":10,"editable":true,"instructions":["Separe um momento para uma atividade tranquila de sua preferência.","Este exemplo organiza uma pausa e não constitui orientação clínica."],"exercises":[]}') on conflict do nothing;
insert into public.activity_templates(id,protocol_id,category,schedule,experiences,content) values
('30000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000001','movimento','training',array['iniciante'],'{"title":"Começar a se movimentar","subtitle":"Encontre sua atividade inicial","icon":"dumbbell","time":"08:00","minutes":30,"editable":true,"instructions":["Reserve esse horário para a atividade orientada pelo profissional que acompanha você.","O exemplo para iniciantes não prescreve exercícios, carga ou intensidade."],"exercises":[]}') on conflict do nothing;
