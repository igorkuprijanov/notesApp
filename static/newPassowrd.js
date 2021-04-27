let userID = window.location.href.split('/')[4]
let xhr = new XMLHttpRequest()
document.getElementById('newRecoveredPasswordIntro').innerHTML = 'Create new password for user: '+userID

function sendNewRecoveryPassword(){
    var password1 = document.getElementById('newRecoveredPassword1').value
    var password2 = document.getElementById('newRecoveredPassword1').value
    
    
    //check for password correctnes
    
    xhr.open('PUT', "/changePassword", true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.addEventListener('load', passwordUpdated)
    xhr.send('password='+password1+'&id='+userID)
    
    console.log('ass')
}

function passwordUpdated(response){
    console.log(response)
    if(response){
        console.log(response)
        document.getElementById('recoverPasswordForm').style.display = 'none'
        document.getElementById('succesonChange').style.display = 'inline'
    }else{
        alert('Something went wrong, please try again')
    }
}

document.getElementById('recoverySendPassword').addEventListener('click', sendNewRecoveryPassword)