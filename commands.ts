import { SlashCommandBuilder } from "@discordjs/builders"

export default [

	new SlashCommandBuilder()
		.setName('blockuser')
		.setDescription('Comando para bloquear a un usuario del sistema de apelación')
		.addUserOption(opt =>
			opt.setName("usuario")
				.setDescription("Usuario a bloquear")
				.setRequired(true)),

	new SlashCommandBuilder()
		.setName('unblockuser')
		.setDescription('Comando para desbloquear a un usuario del sistema de apelación')
		.addUserOption(opt =>
			opt.setName("usuario")
				.setDescription("Usuario a desbloquear")
				.setRequired(true))

]
