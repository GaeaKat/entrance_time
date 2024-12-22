# Entrance time Bot

Entrance time Bot is a Discord bot that automates the server entrance process, allowing users to request access via a guided flow. Staff members can review and approve or deny requests directly within Discord.

## Features

- **Welcome Message**: Automatically sends a welcome message with a button for users to request access.
- **Interactive Modals**: Collects user responses through an interactive modal.
- **Staff Review**: Submissions are sent to a staff channel for approval or denial.
- **Flexible Actions**: Staff can accept or kick users directly from the submission embed.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16.9.0 or higher)
- A Discord bot token
- A configured Discord server with the following:
  - A welcome channel where the bot sends the initial message.
  - A staff channel where staff reviews user requests.
  - A member role to assign to accepted users.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GaeaKat/entrance_time
   cd entrance_time
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Configure the bot:
    - Copy the `.env.example` file to `.env`:
      ```bash
      cp .env.example .env
      ```
    - Open the `.env` file and set the values for the following variables:
      - `DISCORD_TOKEN`: Your Discord bot token.
      - `WELCOME_CHANNEL`: The ID of the welcome channel.
      - `STAFF_CHANNEL`: The ID of the staff channel.
      - `MEMBER_ROLE`: The ID of the member role to assign to users.

4. Build the project:
   ```bash
   yarn run build
   ```
5. Start the bot:
   ```bash
   yarn start
   ```
   

## How It Works

### Initialization
- The bot checks for the presence of the welcome and staff channels during startup. If not found, it logs an error and exits.

### Welcome Message
- Sends a message in the configured welcome channel with a button labeled "Enter the server." This button initiates the access request process.

### User Interaction
1. **Button Click**: Users click the "Enter the server" button.
2. **Modal Form**: A modal is displayed asking:
    - If they accept the server rules.
    - How they found the server.
    - Any additional information they'd like to provide.

### Staff Review
- User submissions are forwarded to the staff channel as an embed with options to "Accept" or "Kick" the user.

### Actions
- **Accept**: Assigns the configured member role to the user.
- **Kick**: Removes the user from the server.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. 