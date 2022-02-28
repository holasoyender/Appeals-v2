export default `
<!DOCTYPE html>
<html lang="en" class="h-100">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link data-n-head="ssr" rel="icon" type="image/png" sizes="512x512" href="https://cdn.discordapp.com/attachments/855118494005198939/942810242364895302/animacion_icono_4.gif">

        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
        <link href="https://fonts.googleapis.com/css2?family=Fira+Sans&display=swap" rel="stylesheet">
        <title>Error</title>
    </head>
    <body class="d-flex h-100 justify-content-center align-items-center">
        <div class="text-center">
            <h1 id="msg" style="color: #f04747;">
                No puedes mandar este formulario dos veces!
            </h1>
            <a href="/" class="text-white">Regresar al inicio</a>
        </div>
    </body>
</html>
<style>
    body {
    background: #36393f;

    font-family: 'Fira Sans', sans-serif;
}

h1 {
    color: white;
}

h2, p {
    color: #b9bbbe;
}

a {
    color: hsl(197,100%,47.8%);
}
label {
    color: #8e9297;
}

label.radio > span:not(.checkmark) {
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;

    margin-left: 32px;
}

label.radio > input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
}

label.radio > .checkmark > span {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

label.radio.checked > .checkmark > span {
    background-color: hsl(235,86.1%,77.5%);
}

select {
    background-color: #2f3136 !important;

    border: 1px solid #202225 !important;
    cursor: pointer !important;
    color: #dcddde !important;
    border-radius: 4px !important;
    font-weight: 500 !important;

    outline: none !important;
    box-shadow: none !important;
}

select:invalid {
    color: #72767d !important;
}

option {
    color: #b9bbbe;
}

textarea {
    color: #dcddde !important;

    background: rgba(0, 0, 0, 0.1) !important;
    border: 1px solid rgba(0, 0, 0, 0.3) !important;

    outline: none !important;
    box-shadow: none !important;

    transition: border-color .2s ease-in-out;
    resize: none;

    overflow-y: hidden;
}

textarea:hover {
    border-color: #040405 !important;
}

textarea:focus {
    border-color: hsl(197,100%,47.8%) !important;
}

</style>
`