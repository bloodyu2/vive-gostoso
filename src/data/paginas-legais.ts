/**
 * Textos das páginas legais: termos de uso, exclusão de conta e o trecho do aplicativo na política de privacidade.
 * Escritos em pt, en e es (o pt é o texto de referência). Revisão de 12/11/2026 contra a LGPD (Lei 13.709/2018),
 * o Código de Defesa do Consumidor (Lei 8.078/1990) e o Marco Civil da Internet (Lei 12.965/2014). Não substitui o parecer de um advogado.
 */

export type Idioma = 'pt' | 'en' | 'es'
export type Secao = { titulo: string; paragrafos?: string[]; itens?: string[]; passos?: string[] }
export type PaginaLegal = { titulo: string; descricao: string; secoes: Secao[]; atualizada: string }

export const CONTATO = 'contato@vivegostoso.com.br'
export const PRIVACIDADE_EMAIL = 'privacidade@vivegostoso.com.br'

export const TERMOS: Record<Idioma, PaginaLegal> = {
  pt: {
    titulo: 'Termos de Uso',
    descricao: 'As regras de uso do site e do aplicativo Vive Gostoso, em linguagem simples.',
    atualizada: 'Última atualização: 12 de novembro de 2026.',
    secoes: [
      {
        titulo: '1. Quem somos e o que é o Vive Gostoso',
        paragrafos: [
          'O Vive Gostoso é o site e o aplicativo de São Miguel do Gostoso, RN, mantidos pela Balaio Digital. Reúnem o guia da cidade, as marés e o vento, o Passaporte Gostoso (cupons e carimbos) e, no aplicativo, pedidos de comida, corridas e pedidos de serviço. Contato: ' + CONTATO + '.',
          'O Vive Gostoso é uma plataforma que conecta pessoas. Quem entrega, quem dirige, quem presta o serviço e quem vende é a pessoa ou o negócio que aceitou o pedido. Isso não limita os direitos que a lei garante ao consumidor.',
        ],
      },
      {
        titulo: '2. Conta',
        paragrafos: [
          'Você pode olhar o guia sem conta. Para pedir, chamar uma corrida, guardar cupons ou trabalhar no aplicativo é preciso criar uma conta com um e-mail seu ou entrar com o Google. Guarde a sua senha e não a passe a ninguém. Você responde pelo que for feito com a sua conta.',
          'Para criar uma conta você deve ter 18 anos ou mais. Menores de 18 anos só podem usar com o consentimento e o acompanhamento de um responsável legal. O aplicativo não é feito para crianças menores de 12 anos.',
        ],
      },
      {
        titulo: '3. Pagamento e mensalidade',
        paragrafos: [
          'O aplicativo não cobra pedido, corrida nem serviço. O preço é combinado entre as pessoas e pago direto, na hora, em Pix, cartão ou dinheiro. O Vive Gostoso não recebe nem repassa esse dinheiro.',
          'A única cobrança do aplicativo é a mensalidade de quem trabalha nele: R$ 4,99 por mês por serviço, e R$ 199 por mês no plano do negócio, cobradas pelo Asaas. O primeiro mês é grátis no período de lançamento, e avisaremos pelo aplicativo e por e-mail antes da primeira cobrança. Você pode cancelar a mensalidade quando quiser, sem multa, pelo e-mail ' + CONTATO + '; a cobrança seguinte deixa de ser feita.',
          'Se a mensalidade de um papel atrasar, só esse papel é pausado, depois de alguns dias de aviso. Ele volta assim que o pagamento é confirmado. Os outros papéis da mesma conta não são afetados.',
        ],
      },
      {
        titulo: '4. Quem trabalha no aplicativo',
        paragrafos: [
          'Só pessoas se cadastram para trabalhar, cada uma com o próprio nome e WhatsApp. Uma agência ou empresa não cadastra funcionários nem escolhe quem vai: cada um faz o próprio cadastro.',
          'Entrega e corrida só abrem depois que a equipe confere o cadastro (nome, WhatsApp, documento e veículo). Mototáxi e táxi precisam de alvará ou licença. Quem trabalha é responsável por ter a habilitação, o documento do veículo e as licenças que a lei exige, e por cumprir as obrigações fiscais e trabalhistas da própria atividade. Quem presta serviço pelo aplicativo não é empregado do Vive Gostoso.',
          'O Vive Gostoso não contrata seguro para corridas, entregas ou serviços. Cada pessoa responde pelo serviço que presta e pelos seguros que a atividade pede.',
        ],
      },
      {
        titulo: '5. O que esperamos de você',
        paragrafos: [
          'Tratar bem as outras pessoas, informar dados verdadeiros, não usar o aplicativo para fraude, assédio, discriminação ou qualquer coisa ilegal, e cancelar com aviso quando não puder cumprir um pedido. Não é permitido copiar, revender ou extrair dados do aplicativo em massa, nem tentar burlar a segurança dele.',
          'Condutas graves podem ser denunciadas no próprio aplicativo (Regras e segurança). Em risco imediato, ligue 190 (polícia) ou 192 (Samu): o aplicativo não é um serviço de emergência.',
        ],
      },
      {
        titulo: '6. Avaliações e mensagens',
        paragrafos: [
          'As notas, os comentários e as mensagens que você envia são de sua responsabilidade. Você nos autoriza a exibi-los no aplicativo, para as pessoas envolvidas, pelo tempo em que a conta existir. Podemos remover conteúdo que desrespeite estes termos ou a lei e, quando a lei exigir, por ordem judicial.',
        ],
      },
      {
        titulo: '7. Suspensão e encerramento',
        paragrafos: [
          'Podemos suspender ou encerrar um papel ou uma conta que descumpra estes termos, que envolva fraude ou risco para outras pessoas, ou por ordem legal. Sempre que possível avisamos antes e explicamos o motivo. Você pode encerrar a sua conta quando quiser, no aplicativo ou pela página de exclusão de conta.',
        ],
      },
      {
        titulo: '8. Disponibilidade e responsabilidade',
        paragrafos: [
          'Fazemos o possível para o aplicativo funcionar sempre, mas ele pode ficar fora do ar, ter erros ou depender de serviços de terceiros (mapas, rotas, internet, Google). Marés, vento e horários são estimativas e não substituem a sua atenção no mar e na estrada.',
          'Problemas com um pedido, uma corrida ou um serviço se resolvem primeiro entre as partes, no chat do aplicativo. O Vive Gostoso ajuda a mediar e pode suspender quem agir de má-fé. Respondemos pelos danos que a lei nos atribui; nada aqui retira direitos que a lei garante e não podem ser afastados por contrato.',
        ],
      },
      {
        titulo: '9. Propriedade intelectual',
        paragrafos: [
          'A marca, o logotipo, o desenho e o código do Vive Gostoso são nossos ou usados com licença. Fotos e textos de negócios e profissionais pertencem a quem os enviou. Você não pode usá-los sem autorização, salvo para o uso normal do aplicativo.',
        ],
      },
      {
        titulo: '10. Seus dados',
        paragrafos: [
          'Como tratamos os seus dados está na Política de Privacidade. Você pode pedir a exclusão da conta e dos dados a qualquer momento, no aplicativo ou pela página de exclusão de conta. O contato do encarregado pelo tratamento de dados é ' + PRIVACIDADE_EMAIL + '.',
        ],
      },
      {
        titulo: '11. Mudanças, lei aplicável e foro',
        paragrafos: [
          'Podemos mudar estes termos. Quando a mudança for importante, avisaremos no aplicativo e no site, e o uso depois do aviso conta como aceite. Estes termos seguem a lei brasileira. Consumidores podem propor ação no foro do próprio domicílio; para as demais pessoas, vale o foro da comarca de São Miguel do Gostoso, RN. Antes de qualquer ação, queremos tentar resolver pela conversa: ' + CONTATO + '.',
        ],
      },
    ],
  },
  en: {
    titulo: 'Terms of Use',
    descricao: 'The rules for using the Vive Gostoso website and app, in plain language.',
    atualizada: 'Last updated: November 12, 2026. Translated from the Portuguese original; if they differ, the Portuguese text prevails.',
    secoes: [
      {
        titulo: '1. Who we are and what Vive Gostoso is',
        paragrafos: [
          'Vive Gostoso is the website and app of São Miguel do Gostoso, RN, Brazil, maintained by Balaio Digital. It brings together the town guide, tides and wind, the Gostoso Passport (coupons and stamps) and, in the app, food orders, rides and service requests. Contact: ' + CONTATO + '.',
          'Vive Gostoso is a platform that connects people. The person or business that accepted the order is the one who delivers, drives, provides the service or sells. This does not limit the rights that the law grants to consumers.',
        ],
      },
      {
        titulo: '2. Account',
        paragrafos: [
          'You can browse the guide without an account. To order, request a ride, keep coupons or work in the app you need an account with your own e-mail, or you can sign in with Google. Keep your password safe and do not share it. You are responsible for what is done with your account.',
          'To create an account you must be 18 or older. People under 18 may only use the app with the consent and supervision of a legal guardian. The app is not meant for children under 12.',
        ],
      },
      {
        titulo: '3. Payment and subscription',
        paragrafos: [
          'The app does not charge for orders, rides or services. The price is agreed between the people and paid directly, on the spot, by Pix, card or cash. Vive Gostoso does not receive or pass on that money.',
          'The only charge in the app is the monthly fee for people who work in it: R$ 4.99 per month per service, and R$ 199 per month for the business plan, billed through Asaas. The first month is free during the launch period, and we will notify you in the app and by e-mail before the first charge. You can cancel the subscription at any time, with no penalty, by e-mailing ' + CONTATO + '; the next charge will not be made.',
          'If the fee for one role is overdue, only that role is paused, after a few days of notice. It comes back as soon as the payment is confirmed. Your other roles are not affected.',
        ],
      },
      {
        titulo: '4. People who work in the app',
        paragrafos: [
          'Only individuals sign up to work, each with their own name and WhatsApp. An agency or company cannot register employees or choose who goes: each person registers on their own.',
          'Deliveries and rides open only after our team checks the registration (name, WhatsApp, ID and vehicle). Motorcycle taxis and taxis need a permit or license. Anyone who works is responsible for having the driving license, vehicle papers and permits the law requires, and for meeting the tax and labor obligations of their own activity. People who provide services through the app are not employees of Vive Gostoso.',
          'Vive Gostoso does not take out insurance for rides, deliveries or services. Each person answers for the service they provide and for the insurance their activity requires.',
        ],
      },
      {
        titulo: '5. What we expect from you',
        paragrafos: [
          'Treat other people well, give true information, do not use the app for fraud, harassment, discrimination or anything illegal, and cancel with notice when you cannot fulfill an order. You may not copy, resell or mass-extract data from the app, or try to bypass its security.',
          'Serious misconduct can be reported inside the app (Rules and safety). In immediate danger, call 190 (police) or 192 (ambulance): the app is not an emergency service.',
        ],
      },
      {
        titulo: '6. Ratings and messages',
        paragrafos: [
          'The ratings, comments and messages you send are your responsibility. You allow us to show them in the app, to the people involved, for as long as the account exists. We may remove content that breaks these terms or the law and, where the law requires, by court order.',
        ],
      },
      {
        titulo: '7. Suspension and closing',
        paragrafos: [
          'We may suspend or close a role or an account that breaks these terms, involves fraud or risk to other people, or by legal order. Whenever possible we warn you first and explain why. You can close your account at any time, in the app or on the account deletion page.',
        ],
      },
      {
        titulo: '8. Availability and liability',
        paragrafos: [
          'We do our best to keep the app running, but it may be offline, have errors or depend on third-party services (maps, routes, internet, Google). Tides, wind and times are estimates and do not replace your own attention at sea and on the road.',
          'Problems with an order, a ride or a service are first solved between the parties, in the app chat. Vive Gostoso helps mediate and may suspend anyone acting in bad faith. We answer for the damages that the law assigns to us; nothing here removes rights that the law grants and that cannot be waived by contract.',
        ],
      },
      {
        titulo: '9. Intellectual property',
        paragrafos: [
          'The Vive Gostoso brand, logo, design and code belong to us or are used under license. Photos and texts of businesses and professionals belong to whoever sent them. You may not use them without permission, except for normal use of the app.',
        ],
      },
      {
        titulo: '10. Your data',
        paragrafos: [
          'How we handle your data is in the Privacy Policy. You can ask for your account and data to be deleted at any time, in the app or on the account deletion page. The data protection contact is ' + PRIVACIDADE_EMAIL + '.',
        ],
      },
      {
        titulo: '11. Changes, governing law and venue',
        paragrafos: [
          'We may change these terms. When a change is important we will tell you in the app and on the site, and continued use after the notice counts as acceptance. These terms follow Brazilian law. Consumers may bring a claim in the courts of their own home; for everyone else, the courts of São Miguel do Gostoso, RN, apply. Before any claim we would like to try to settle it by talking: ' + CONTATO + '.',
        ],
      },
    ],
  },
  es: {
    titulo: 'Términos de Uso',
    descricao: 'Las reglas de uso del sitio y de la aplicación Vive Gostoso, en lenguaje sencillo.',
    atualizada: 'Última actualización: 12 de noviembre de 2026. Traducido del original en portugués; si difieren, prevalece el texto en portugués.',
    secoes: [
      {
        titulo: '1. Quiénes somos y qué es Vive Gostoso',
        paragrafos: [
          'Vive Gostoso es el sitio web y la aplicación de São Miguel do Gostoso, RN, Brasil, mantenidos por Balaio Digital. Reúnen la guía de la ciudad, las mareas y el viento, el Pasaporte Gostoso (cupones y sellos) y, en la aplicación, pedidos de comida, viajes y solicitudes de servicio. Contacto: ' + CONTATO + '.',
          'Vive Gostoso es una plataforma que conecta personas. Quien entrega, conduce, presta el servicio o vende es la persona o el negocio que aceptó el pedido. Esto no limita los derechos que la ley garantiza al consumidor.',
        ],
      },
      {
        titulo: '2. Cuenta',
        paragrafos: [
          'Puedes ver la guía sin cuenta. Para pedir, solicitar un viaje, guardar cupones o trabajar en la aplicación necesitas una cuenta con un correo tuyo, o puedes entrar con Google. Guarda tu contraseña y no la compartas. Eres responsable de lo que se haga con tu cuenta.',
          'Para crear una cuenta debes tener 18 años o más. Los menores de 18 solo pueden usar la aplicación con el consentimiento y el acompañamiento de un responsable legal. La aplicación no está hecha para niños menores de 12 años.',
        ],
      },
      {
        titulo: '3. Pago y mensualidad',
        paragrafos: [
          'La aplicación no cobra pedidos, viajes ni servicios. El precio se acuerda entre las personas y se paga directamente, en el momento, con Pix, tarjeta o efectivo. Vive Gostoso no recibe ni transfiere ese dinero.',
          'El único cobro de la aplicación es la mensualidad de quienes trabajan en ella: R$ 4,99 al mes por servicio, y R$ 199 al mes en el plan del negocio, cobradas por Asaas. El primer mes es gratis durante el lanzamiento, y avisaremos en la aplicación y por correo antes del primer cobro. Puedes cancelar la mensualidad cuando quieras, sin multa, escribiendo a ' + CONTATO + '; el siguiente cobro dejará de hacerse.',
          'Si la mensualidad de un rol se atrasa, solo ese rol se pausa, después de unos días de aviso. Vuelve en cuanto se confirma el pago. Tus otros roles no se ven afectados.',
        ],
      },
      {
        titulo: '4. Quienes trabajan en la aplicación',
        paragrafos: [
          'Solo se registran personas para trabajar, cada una con su propio nombre y WhatsApp. Una agencia o empresa no registra empleados ni elige quién va: cada persona hace su propio registro.',
          'Las entregas y los viajes solo se abren después de que el equipo revisa el registro (nombre, WhatsApp, documento y vehículo). Los mototaxis y taxis necesitan permiso o licencia. Quien trabaja es responsable de tener la licencia de conducir, los documentos del vehículo y los permisos que exige la ley, y de cumplir las obligaciones fiscales y laborales de su propia actividad. Quien presta servicios por la aplicación no es empleado de Vive Gostoso.',
          'Vive Gostoso no contrata seguros para viajes, entregas ni servicios. Cada persona responde por el servicio que presta y por los seguros que su actividad requiere.',
        ],
      },
      {
        titulo: '5. Lo que esperamos de ti',
        paragrafos: [
          'Tratar bien a las demás personas, dar datos verdaderos, no usar la aplicación para fraude, acoso, discriminación ni nada ilegal, y cancelar con aviso cuando no puedas cumplir un pedido. No está permitido copiar, revender ni extraer datos de la aplicación de forma masiva, ni intentar burlar su seguridad.',
          'Las conductas graves pueden denunciarse en la propia aplicación (Reglas y seguridad). En peligro inmediato, llama al 190 (policía) o al 192 (ambulancia): la aplicación no es un servicio de emergencia.',
        ],
      },
      {
        titulo: '6. Calificaciones y mensajes',
        paragrafos: [
          'Las notas, los comentarios y los mensajes que envías son de tu responsabilidad. Nos autorizas a mostrarlos en la aplicación, a las personas involucradas, mientras exista la cuenta. Podemos retirar contenido que incumpla estos términos o la ley y, cuando la ley lo exija, por orden judicial.',
        ],
      },
      {
        titulo: '7. Suspensión y cierre',
        paragrafos: [
          'Podemos suspender o cerrar un rol o una cuenta que incumpla estos términos, que implique fraude o riesgo para otras personas, o por orden legal. Siempre que sea posible avisamos antes y explicamos el motivo. Puedes cerrar tu cuenta cuando quieras, en la aplicación o en la página de eliminación de cuenta.',
        ],
      },
      {
        titulo: '8. Disponibilidad y responsabilidad',
        paragrafos: [
          'Hacemos lo posible para que la aplicación funcione siempre, pero puede estar fuera de línea, tener errores o depender de servicios de terceros (mapas, rutas, internet, Google). Las mareas, el viento y los horarios son estimaciones y no sustituyen tu atención en el mar y en la carretera.',
          'Los problemas con un pedido, un viaje o un servicio se resuelven primero entre las partes, en el chat de la aplicación. Vive Gostoso ayuda a mediar y puede suspender a quien actúe de mala fe. Respondemos por los daños que la ley nos atribuye; nada de esto quita derechos que la ley garantiza y que no pueden renunciarse por contrato.',
        ],
      },
      {
        titulo: '9. Propiedad intelectual',
        paragrafos: [
          'La marca, el logotipo, el diseño y el código de Vive Gostoso son nuestros o se usan con licencia. Las fotos y los textos de negocios y profesionales pertenecen a quien los envió. No puedes usarlos sin autorización, salvo para el uso normal de la aplicación.',
        ],
      },
      {
        titulo: '10. Tus datos',
        paragrafos: [
          'Cómo tratamos tus datos está en la Política de Privacidad. Puedes pedir la eliminación de tu cuenta y tus datos en cualquier momento, en la aplicación o en la página de eliminación de cuenta. El contacto para protección de datos es ' + PRIVACIDADE_EMAIL + '.',
        ],
      },
      {
        titulo: '11. Cambios, ley aplicable y foro',
        paragrafos: [
          'Podemos cambiar estos términos. Cuando el cambio sea importante, avisaremos en la aplicación y en el sitio, y seguir usando después del aviso cuenta como aceptación. Estos términos siguen la ley brasileña. Los consumidores pueden presentar una acción en el foro de su propio domicilio; para las demás personas, rige el foro de São Miguel do Gostoso, RN. Antes de cualquier acción, queremos intentar resolverlo conversando: ' + CONTATO + '.',
        ],
      },
    ],
  },
}

export const EXCLUIR: Record<Idioma, PaginaLegal & { assuntoEmail: string; corpoEmail: string }> = {
  pt: {
    titulo: 'Excluir minha conta',
    descricao: 'Como apagar a sua conta e os seus dados do Vive Gostoso, no aplicativo ou por e-mail.',
    atualizada: 'Última atualização: 12 de novembro de 2026.',
    assuntoEmail: 'Excluir minha conta do Vive Gostoso',
    corpoEmail: 'Quero excluir a minha conta do Vive Gostoso e os dados ligados a ela.\n\nE-mail da conta: \nNome: ',
    secoes: [
      { titulo: 'Pelo aplicativo (o jeito mais rápido)', passos: ['Abra o aplicativo Vive Gostoso e entre na sua conta.', 'Toque em Eu, na barra de baixo.', 'Role até o fim e toque em Excluir minha conta.', 'Digite EXCLUIR para confirmar e toque em Excluir tudo.'], paragrafos: ['A exclusão apaga a conta na hora e não pode ser desfeita.'] },
      { titulo: 'Sem acesso ao aplicativo', paragrafos: ['Envie um e-mail para {EMAIL} a partir do e-mail da conta, com o assunto "Excluir minha conta". Respondemos em até 5 dias úteis e apagamos os dados em até 30 dias. Se o e-mail vier de outro endereço, vamos pedir uma confirmação antes de apagar, para que ninguém exclua a conta de outra pessoa.', 'Isso vale para a conta do aplicativo e para o cadastro no site (negócio, profissional ou Passaporte), que usam o mesmo e-mail.'] },
      { titulo: 'O que é apagado', itens: ['A conta, o nome, o e-mail e a foto, se houver.', 'Os cadastros de trabalho (entregador, motorista, prestador, negócio) e a disponibilidade.', 'Pedidos, corridas, pedidos de serviço, orçamentos e mensagens ligados à conta.', 'Carimbos e cupons do Passaporte, itens salvos, endereços, avisos e os aparelhos registrados para receber avisos.'] },
      { titulo: 'O que pode ficar guardado', paragrafos: ['Registros que a lei manda guardar por um tempo, como os de cobranças da mensalidade feitas pelo Asaas, e dados sem identificação, usados só para contar o uso do site. Eles não servem para identificar você depois da exclusão.'] },
      { titulo: 'Dúvidas', paragrafos: ['Fale com a gente em ' + CONTATO + '. Veja também a Política de Privacidade e os Termos de Uso do Vive Gostoso.'] },
    ],
  },
  en: {
    titulo: 'Delete my account',
    descricao: 'How to delete your Vive Gostoso account and data, in the app or by e-mail.',
    atualizada: 'Last updated: November 12, 2026.',
    assuntoEmail: 'Delete my Vive Gostoso account',
    corpoEmail: 'I want to delete my Vive Gostoso account and the data linked to it.\n\nAccount e-mail: \nName: ',
    secoes: [
      { titulo: 'In the app (the fastest way)', passos: ['Open the Vive Gostoso app and sign in.', 'Tap Me (Eu), on the bottom bar.', 'Scroll to the end and tap Delete my account (Excluir minha conta).', 'Type EXCLUIR to confirm and tap Delete everything (Excluir tudo).'], paragrafos: ['Deletion removes the account right away and cannot be undone.'] },
      { titulo: 'Without access to the app', paragrafos: ['Send an e-mail to {EMAIL} from the account e-mail, with the subject "Delete my account". We reply within 5 business days and delete the data within 30 days. If the e-mail comes from another address, we will ask for confirmation before deleting, so nobody deletes another person\'s account.', 'This covers the app account and the website registration (business, professional or Passport), which use the same e-mail.'] },
      { titulo: 'What is deleted', itens: ['The account, name, e-mail and photo, if any.', 'Work registrations (courier, driver, service provider, business) and availability.', 'Orders, rides, service requests, quotes and messages linked to the account.', 'Passport stamps and coupons, saved items, addresses, notices and the devices registered to receive notifications.'] },
      { titulo: 'What may be kept', paragrafos: ['Records that the law requires us to keep for a period, such as billing records for the subscription made through Asaas, and non-identifying data used only to count site usage. They cannot be used to identify you after deletion.'] },
      { titulo: 'Questions', paragrafos: ['Write to us at ' + CONTATO + '. See also the Privacy Policy and the Terms of Use of Vive Gostoso.'] },
    ],
  },
  es: {
    titulo: 'Eliminar mi cuenta',
    descricao: 'Cómo borrar tu cuenta y tus datos de Vive Gostoso, en la aplicación o por correo.',
    atualizada: 'Última actualización: 12 de noviembre de 2026.',
    assuntoEmail: 'Eliminar mi cuenta de Vive Gostoso',
    corpoEmail: 'Quiero eliminar mi cuenta de Vive Gostoso y los datos vinculados a ella.\n\nCorreo de la cuenta: \nNombre: ',
    secoes: [
      { titulo: 'En la aplicación (lo más rápido)', passos: ['Abre la aplicación Vive Gostoso e inicia sesión.', 'Toca Yo (Eu), en la barra de abajo.', 'Desplázate hasta el final y toca Eliminar mi cuenta (Excluir minha conta).', 'Escribe EXCLUIR para confirmar y toca Eliminar todo (Excluir tudo).'], paragrafos: ['La eliminación borra la cuenta al instante y no se puede deshacer.'] },
      { titulo: 'Sin acceso a la aplicación', paragrafos: ['Envía un correo a {EMAIL} desde el correo de la cuenta, con el asunto "Eliminar mi cuenta". Respondemos en hasta 5 días hábiles y borramos los datos en hasta 30 días. Si el correo viene de otra dirección, pediremos una confirmación antes de borrar, para que nadie elimine la cuenta de otra persona.', 'Esto vale para la cuenta de la aplicación y para el registro en el sitio (negocio, profesional o Pasaporte), que usan el mismo correo.'] },
      { titulo: 'Qué se borra', itens: ['La cuenta, el nombre, el correo y la foto, si hay.', 'Los registros de trabajo (repartidor, conductor, prestador, negocio) y la disponibilidad.', 'Pedidos, viajes, solicitudes de servicio, presupuestos y mensajes vinculados a la cuenta.', 'Sellos y cupones del Pasaporte, elementos guardados, direcciones, avisos y los dispositivos registrados para recibir avisos.'] },
      { titulo: 'Qué puede quedar guardado', paragrafos: ['Registros que la ley manda guardar por un tiempo, como los de cobros de la mensualidad hechos por Asaas, y datos sin identificación, usados solo para contar el uso del sitio. No sirven para identificarte después de la eliminación.'] },
      { titulo: 'Dudas', paragrafos: ['Escríbenos a ' + CONTATO + '. Mira también la Política de Privacidad y los Términos de Uso de Vive Gostoso.'] },
    ],
  },
}

/** Trecho do aplicativo na política de privacidade (seção 8). */
export const PRIVACIDADE_APP: Record<Idioma, Secao> = {
  pt: {
    titulo: '8. Aplicativo Vive Gostoso',
    paragrafos: ['O aplicativo Vive Gostoso usa os mesmos princípios desta política e trata, além dos dados do site, os que seguem. Usamos cada dado só para a função descrita.'],
    itens: [
      'Conta: nome, e-mail e senha (guardada de forma protegida pelo nosso provedor de login) ou o login com o Google. Para quem trabalha no aplicativo, também o WhatsApp, a descrição do que faz, o veículo e, quando pedimos, o documento, para conferir o cadastro.',
      'Localização: só com a sua permissão e com o aplicativo aberto. Serve para mostrar o mapa, calcular rotas e distâncias e, para quem trabalha e liga o botão online, ordenar a fila de pedidos. O ponto exato do cliente só vai a quem aceitou o pedido; quem faz orçamento vê um ponto aproximado.',
      'Pedidos, corridas, pedidos de serviço, orçamentos, mensagens e avaliações: para realizar o serviço, mostrar o histórico e manter a segurança. O telefone do cliente não aparece para quem faz orçamento.',
      'Aparelho: um código do aparelho (token de avisos do Firebase, do Google) para enviar os avisos de pedido, corrida e oferta. Você pode desligar os avisos no aparelho.',
      'Cobrança da mensalidade: o CPF ou CNPJ é informado direto ao Asaas, que emite a cobrança; nós não guardamos esse número.',
    ],
  },
  en: {
    titulo: '8. Vive Gostoso app',
    paragrafos: ['The Vive Gostoso app follows the same principles as this policy and handles, besides the site data, the following. We use each piece of data only for the function described.'],
    itens: [
      'Account: name, e-mail and password (stored in protected form by our sign-in provider) or Google sign-in. For people who work in the app, also WhatsApp, a description of what they do, the vehicle and, when we ask, an ID document, to check the registration.',
      'Location: only with your permission and with the app open. It is used to show the map, compute routes and distances and, for people who work and switch online on, to order the queue of requests. The customer\'s exact point only goes to whoever accepted the order; people who send quotes see an approximate point.',
      'Orders, rides, service requests, quotes, messages and ratings: to deliver the service, show the history and keep things safe. The customer\'s phone is not shown to people who send quotes.',
      'Device: a device code (Firebase notification token, from Google) to send order, ride and offer notices. You can turn notices off on the device.',
      'Subscription billing: the CPF or CNPJ (Brazilian tax ID) is given directly to Asaas, which issues the charge; we do not store that number.',
    ],
  },
  es: {
    titulo: '8. Aplicación Vive Gostoso',
    paragrafos: ['La aplicación Vive Gostoso sigue los mismos principios de esta política y trata, además de los datos del sitio, los siguientes. Usamos cada dato solo para la función descrita.'],
    itens: [
      'Cuenta: nombre, correo y contraseña (guardada de forma protegida por nuestro proveedor de acceso) o el acceso con Google. Para quienes trabajan en la aplicación, también el WhatsApp, la descripción de lo que hacen, el vehículo y, cuando lo pedimos, el documento, para revisar el registro.',
      'Ubicación: solo con tu permiso y con la aplicación abierta. Sirve para mostrar el mapa, calcular rutas y distancias y, para quienes trabajan y activan el botón en línea, ordenar la fila de pedidos. El punto exacto del cliente solo llega a quien aceptó el pedido; quien hace presupuestos ve un punto aproximado.',
      'Pedidos, viajes, solicitudes de servicio, presupuestos, mensajes y calificaciones: para realizar el servicio, mostrar el historial y mantener la seguridad. El teléfono del cliente no se muestra a quien hace presupuestos.',
      'Dispositivo: un código del dispositivo (token de avisos de Firebase, de Google) para enviar los avisos de pedido, viaje y oferta. Puedes desactivar los avisos en el dispositivo.',
      'Cobro de la mensualidad: el CPF o CNPJ (identificación fiscal brasileña) se informa directamente a Asaas, que emite el cobro; no guardamos ese número.',
    ],
  },
}

/** Quem recebe os dados no aplicativo (seção 9 da política). */
export const PRIVACIDADE_TERCEIROS: Record<Idioma, Secao> = {
  pt: {
    titulo: '9. Com quem os dados passam',
    paragrafos: ['Não vendemos dados. Usamos empresas que trabalham para nós, cada uma só para o que precisa:'],
    itens: [
      'Supabase: hospedagem do banco de dados e do login (servidores no Brasil).',
      'Google (Firebase Cloud Messaging e login com o Google): avisos no aparelho e entrada com a conta Google, se você escolher.',
      'Resend: envio dos e-mails de confirmação de conta e de senha nova.',
      'Asaas: cobrança da mensalidade de quem trabalha no aplicativo.',
      'OpenStreetMap e serviços abertos de rota e busca de endereço: recebem as coordenadas necessárias para desenhar o mapa e traçar a rota, sem o seu nome.',
      'Autoridades, quando a lei exigir.',
    ],
  },
  en: {
    titulo: '9. Who receives the data',
    paragrafos: ['We do not sell data. We use companies that work for us, each only for what it needs:'],
    itens: [
      'Supabase: hosting of the database and sign-in (servers in Brazil).',
      'Google (Firebase Cloud Messaging and Google sign-in): device notices and sign-in with a Google account, if you choose it.',
      'Resend: sending account confirmation and new password e-mails.',
      'Asaas: billing the subscription of people who work in the app.',
      'OpenStreetMap and open routing and address search services: they receive the coordinates needed to draw the map and plot the route, without your name.',
      'Authorities, when the law requires.',
    ],
  },
  es: {
    titulo: '9. Con quién pasan los datos',
    paragrafos: ['No vendemos datos. Usamos empresas que trabajan para nosotros, cada una solo para lo que necesita:'],
    itens: [
      'Supabase: alojamiento de la base de datos y del acceso (servidores en Brasil).',
      'Google (Firebase Cloud Messaging y acceso con Google): avisos en el dispositivo y entrada con la cuenta de Google, si la eliges.',
      'Resend: envío de los correos de confirmación de cuenta y de contraseña nueva.',
      'Asaas: cobro de la mensualidad de quienes trabajan en la aplicación.',
      'OpenStreetMap y servicios abiertos de ruta y búsqueda de direcciones: reciben las coordenadas necesarias para dibujar el mapa y trazar la ruta, sin tu nombre.',
      'Autoridades, cuando la ley lo exija.',
    ],
  },
}
