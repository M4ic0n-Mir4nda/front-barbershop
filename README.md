# 💇‍♂️ Barbershop - Front-end

Este repositório contém a interface web da plataforma **Barbershop**, desenvolvida em **React 18** com foco em responsividade, fluidez e uma experiência de usuário intuitiva tanto para clientes quanto para os administradores da barbearia.

## 🚀 Funcionalidades

- Interface pública acessível via link exclusivo da barbearia
- Visualização de serviços, valores e localização
- Formulário completo para agendamento de serviços
- Confirmação visual do agendamento
- Login e área administrativa integrada com a API
- Navegação fluída com React Router

## 🧰 Tecnologias Utilizadas

| Biblioteca/Framework  | Finalidade                                        |
| --------------------- | ------------------------------------------------- |
| **React 18**          | Biblioteca principal para construção da interface |
| **React Router DOM**  | Gerenciamento de rotas e navegação entre páginas  |
| **MUI (Material UI)** | Componentes visuais modernos e responsivos        |
| **Emotion**           | Estilização com CSS-in-JS                         |
| **Axios**             | Comunicação com a API back-end                    |
| **Dayjs**             | Manipulação de datas e horários                   |
| **JS-Cookie**         | Armazenamento de tokens e dados em cookies        |
| **Notistack**         | Sistema de notificações fluídas e empilháveis     |
| **Dotenv**            | Uso de variáveis de ambiente no front-end         |
| **React Scroll**      | Rolagem suave entre seções                        |
| **Testing Library**   | Testes unitários e de integração                  |

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_WHATSAPP=http://localhost:3010
PORT=3005
```

## 📦 Instalação

Certifique-se de ter o **Node.js** instalado. Em seguida:

```bash
npm install
```

## ▶️ Execução

```bash
npm start
```

### Após iniciada acesse a rota http://localhost:3005/login

## 🌐 Integração com a API

### A aplicação se comunica com a API do Barbershop (Spring Boot) utilizando requisições HTTP via axios. Certifique-se de que a API esteja rodando localmente em http://localhost:8080 ou configure o endpoint via .env.

## 💡 Diferenciais

- Design responsivo com MUI
- Navegação clara entre páginas e formulários
- Integração completa com autenticação JWT
- Agendamento de serviços fácil e intuitivo

## 🙋‍♂️ Autor

Desenvolvido por [Maicon Miranda](https://github.com/M4ic0n-Mir4nda).
