function requestResponse(){
    console.log(this.responseText)

    if(this.responseText === ''){
        console.log('user does not exist')
    }else{
        castDashboard(this.responseText)
    }
}

let info
let url = window.location.href

function castDashboard(userData){
    console.log('createing dashboard')
    
    clearAll()
    
    let data = JSON.parse(userData)
    console.log(data)
    document.getElementById('showAll').removeEventListener('click', showAll)
    document.getElementById('loginButton').removeEventListener('click', logIn)
    document.getElementById('mainDiv').style.display = 'none'
    document.getElementById('dashboard').style.display = 'flex'
    
    info = data
    
    document.getElementById('userName').innerText = data.name
    document.getElementById('userImage').setAttribute('src', data.image)
    data.tasks.forEach((task)=>{
        
        let newElement = document.createElement('div')
        let newHeading = document.createElement('h2')
        let newDescription = document.createElement('p')
        let newDate = document.createElement('p')
        let newRemoveButton = document.createElement('button')
        let newId = document.createElement('p')
        let newEditButton = document.createElement('button')
        
        newElement.setAttribute('class', 'tasksContainer')
        newHeading.setAttribute('class', 'taskHeading')
        newDescription.setAttribute('class', 'taskDescription')
        newDate.setAttribute('class', 'taskDate')
        newRemoveButton.addEventListener('click', removeNote)
        newRemoveButton.innerHTML = 'REMOVE'
        newRemoveButton.setAttribute('class', 'removeButton')
        newId.setAttribute('class', 'noteId')
        newEditButton.setAttribute('class', 'editButton')
        newEditButton.addEventListener('click', editNote)
        newEditButton.innerHTML = "EDIT"
        
        document.getElementById('notesContainer').appendChild(newElement)
        newElement.appendChild(newHeading)
        newElement.appendChild(newDescription)
        newElement.appendChild(newDate)
        newElement.appendChild(newId)
        newElement.appendChild(newRemoveButton)
        newElement.appendChild(newEditButton)
        
        newHeading.innerHTML = task.name
        newDescription.innerHTML = task.description
        newDate.innerHTML = task.date
        newId.innerHTML = task.id
    })
}

function editNote(){
    console.log(this.parentElement.children)
    this.parentElement.lastElementChild.style.display = 'none'
    this.parentElement.children.item(0).setAttribute('contenteditable', true)
    this.parentElement.children.item(0).style.border = '1px solid gray'
    this.parentElement.children.item(1).setAttribute('contenteditable', true)
    this.parentElement.children.item(1).style.border = '1px solid gray'
    this.parentElement.style.border = '2px solid black'
    this.parentElement.children.item(1).focus()
    addSaveButton(this.parentElement)
    
}

function addSaveButton(note){
    let newSaveButton = document.createElement('button')
    newSaveButton.innerHTML = "SAVE"
    newSaveButton.setAttribute('id', 'saveButton')
    note.appendChild(newSaveButton)
    newSaveButton.addEventListener('click', saveNote)
}

function saveNote(note){
    console.log('save note')
    this.parentElement.children.item(0).setAttribute('contenteditable', false)
    this.parentElement.children.item(0).style.border = 'none'
    this.parentElement.children.item(1).setAttribute('contenteditable', false)
    this.parentElement.children.item(1).style.border = 'none'
    this.parentElement.style.border = '1px solid gray'
    this.parentElement.children.item(this.parentElement.childElementCount -2).style.display = 'inline'
    
    let newTitle = this.parentElement.children.item(0).innerHTML
    let newDescription = this.parentElement.children.item(1).innerHTML
    let noteId = this.parentElement.children.item(3).innerHTML
    
    console.log(newTitle)
    console.log(newDescription)
    console.log(info._id)
    
    this.removeEventListener('click', saveNote)
    this.remove()
    
    xhr.open('PUT', url+'update/'+info._id, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send('name='+newTitle+'&description='+newDescription+'&id='+noteId)
}

function removeNote(){
    this.parentElement.remove()
    let noteId = this.parentElement.children.item(3).innerHTML
    console.log(noteId)
    
    xhr.open('DELETE', url+'users/'+info._id, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send('id='+noteId)
}


function clearAll(){
    while(document.getElementById('notesContainer').firstChild){
        document.getElementById('notesContainer').removeChild(document.getElementById('notesContainer').firstChild)
    }
}

function printUsers(){
    console.log(this.responseText)
}


let xhr = new XMLHttpRequest()

function showAll(){
    xhr.addEventListener('load', printUsers)
    xhr.open('GET', url+"users")
    xhr.send()
}

function logIn(){
    let password = document.getElementById('passwordInput').value
    let username = document.getElementById('usernameInput').value
    
    xhr.open('POST', url+"users", true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.addEventListener('load', requestResponse)
    xhr.send('name='+username+'&password='+password)
}

function logOut(){
    xhr.open('GET', url, true)
    xhr.addEventListener('load', ()=>{
        location.reload()
    })
    
    xhr.send()
}

function addNewTask(){
    let taskName = document.getElementById('newTasksName').value
    let taskDescription = document.getElementById('newTaskDescription').value
    let id = document.getElementById('notesContainer').childElementCount
    //id needs to be fixed, a lot of repeating ids

    xhr.open('PUT', url+"newTask/"+info._id, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send('name='+taskName+'&description='+taskDescription+'&id='+id)
    
}

function userRegistrationResponse(){
    if(this.response == ''){
        nameError()
    }else{
        closeRegistration() 
    }
}

function createNewUser(){
    console.log('create new user')
    document.getElementById('registerForm').style.display = 'flex'
    document.getElementById('registerUserButton').addEventListener('click', sendNewUser)
    document.getElementById('cancleRegistration').addEventListener('click', closeRegistration)
}

function sendNewUser(){
    let newUserName = document.getElementById('newUserName').value
    let newUserPassword = document.getElementById('newUserPassword').value
    let newUserPasswordRepeat = document.getElementById('newUserPasswordRepeat').value
    
    console.log(newUserName)
    console.log(newUserPassword)
    console.log(newUserPasswordRepeat)
    
    document.getElementById('usernameError').style.display = 'none'
    document.getElementById('differentPasswordError').style.display='none'
    document.getElementById('newUserPassword').style.border = '1px solid black'
    document.getElementById('newUserPasswordRepeat').style.border = '1px solid black'
    
    if(checkNewPassword(newUserPassword, newUserPasswordRepeat) && newUserName != ''){
        xhr.open('POST', url, true)
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        xhr.addEventListener('load', userRegistrationResponse)
        xhr.send('name='+newUserName+'&password='+newUserPassword) 
         
    }else if(newUserName == ''){
        console.log('wrong name')
        nameError()
    }else{
        document.getElementById('differentPasswordError').style.display='inline'
        document.getElementById('newUserPassword').style.border = '1px solid red'
        document.getElementById('newUserPasswordRepeat').style.border = '1px solid red'
    }
}

function nameError(){
    document.getElementById('usernameError').style.display = 'inline'
}

function checkNewPassword(password1, password2){
    let suitablePassword = /\d+/g 
    let containsDigit = /\d+/g
    let containsSpecialChar = /\W+/g
    let containsCapitalLetter = /[A-Z]/g
    
    console.log(password1.length)
    console.log(password1.match(containsDigit))
    console.log(password1.match(containsSpecialChar))
    console.log(password1.match(containsCapitalLetter))
    
    if(password1 === password2){
        if(password1.length > 8){
        if(password1.match(containsDigit)){
            console.log('contains a number')
            if(password1.match(containsSpecialChar)){
                console.log('contains Special Chas')
                if(password1.match(containsCapitalLetter)){
                    console.log('contains capital letter')
                    document.getElementById('differentPasswordError').innerHTML = 'passwords dont match, or dont meet password requierments'
                    return true
                }else{
                    console.log('no capital letter')
                    document.getElementById('differentPasswordError').innerHTML = 'Password does not contain a capital letter'
                }
            }else{
                console.log('no special character')
                document.getElementById('differentPasswordError').innerHTML = 'Password does not contain a special character'
            }
        }else{
            console.log('no digit')
            document.getElementById('differentPasswordError').innerHTML = 'Password does not contain a number'
        }
        }else{
            document.getElementById('differentPasswordError').innerHTML = 'Password must be at least 8 charachters long'
        }
    }else{
        document.getElementById('differentPasswordError').innerHTML = 'Passwords dont match'
    }
}

function deleteUser(){
    console.log('delete user')
    xhr.open('DELETE', url+'deleteUser/'+info._id, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send()
    location.reload()
}

function closeRegistration(){
    
    document.getElementById('registerForm').style.display = 'none'
    document.getElementById('registerUserButton').removeEventListener('click', sendNewUser)
    document.getElementById('cancleRegistration').removeEventListener('click', closeRegistration)
    document.getElementById('newUserName').value = ''
    document.getElementById('newUserPassword').value = ''
    document.getElementById('newUserPasswordRepeat').value = ''
    document.getElementById('usernameError').style.display = 'none'
    document.getElementById('differentPasswordError').style.display='none'
    document.getElementById('newUserPassword').style.border = '1px solid black'
    document.getElementById('newUserPasswordRepeat').style.border = '1px solid black'
    
}

let defaultUserImages = 
    [
        './userImages/userimagetest.jpg',
        './userImages/userimagetest1.jpg',
        './userImages/userimagetest2.jpg',
        './userImages/userimagetest3.jpg',
    ]

function castImageChangeMenu(){
    closeImageSelection()
    document.getElementById('userImageMenu').style.display = 'flex'
    document.getElementById('cancelUserImageMenu').addEventListener('click', closeImageSelection)
    //document.getElementById('uploadUserImageButton').addEventListener('click', uploadUserImage)
    document.getElementById('saveUserImage').addEventListener('click', saveUserImage)
    for(let i = 0; i<defaultUserImages.length; i++){
        
        let imageContiner = document.createElement('div')
        let image = document.createElement('img')
        
        image.setAttribute('class', 'defaultImageSelection')
        image.setAttribute('src', defaultUserImages[i])
        
        document.getElementById('imageSelection').appendChild(imageContiner)
        imageContiner.appendChild(image)
        image.addEventListener('click', selectUserImage)
    }
}

function saveUserImage(){
    console.log('save new image')
    let selectedImage
    for(let i =0; i<document.getElementById('imageSelection').childElementCount; i++){
        if(document.getElementById('imageSelection').children[i].firstChild.style.border === "3px solid rgb(30, 203, 225)"){
            selectedImage = document.getElementById('imageSelection').children[i].firstElementChild
    }}
    document.getElementById('userImage').setAttribute('src', selectedImage.src)
    saveNewImage(selectedImage)
    closeImageSelection()
}


function uploadUserImage(){
    console.log(this.files)
    if(this.files != undefined){
        const fileList = this.files
        appropriateType(fileList[0])
        console.log(fileList[0])
        if(fileList[0].size < 2097152){
            if(appropriateType(fileList[0])){
                let imageUrl = URL.createObjectURL(fileList[0])
                console.log(imageUrl)
                document.getElementById('imageform').setAttribute('action', 'upload/'+info._id)
                document.getElementById('userImage').setAttribute('src', imageUrl)
                sendImage(fileList)
            }else{
                alert('Inappropriate file type')
            }
        }else{
            alert('file is too big')
        }
    }
}

function appropriateType(file){
    if(file.type == 'image/jpeg' || file.type == 'image/png' || file.type == 'image/svg+xml' || file.type == 'image/bmp'){
        return true
    }else{
        return false
    }
}

function sendImage(file){
    let form = document.getElementById('imageform')
    let formData = new FormData(form)
    console.log(document.getElementById('imageform'))
    formData.append('userfile', file)
    console.log(formData)
    xhr.open('POST', form.action, true)
    xhr.addEventListener('load', requestResponse)
    xhr.send(formData)
    closeImageSelection()
}

function selectUserImage(){
    for(let i =0; i<document.getElementById('imageSelection').childElementCount; i++){
        document.getElementById('imageSelection').children[i].firstChild.style.border = 'none'
    }
    this.style.border = '3px solid #1ecbe1'
}

function saveNewImage(newImage){
    console.log(newImage.src)
    xhr.open('PUT', url+'updateImage/'+info._id, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send('image='+newImage.src)
}


function closeImageSelection(){
    document.getElementById('userImageMenu').style.display = 'none'
    document.getElementById('cancelUserImageMenu').removeEventListener('click', closeImageSelection)
    
    while(document.getElementById('imageSelection').firstChild){
        document.getElementById('imageSelection').removeChild(document.getElementById('imageSelection').firstChild)
    }
}

document.getElementById('uploadUserImageInput').addEventListener('change', uploadUserImage)
document.getElementById('changeUserImageButton').addEventListener('click', castImageChangeMenu)
document.getElementById('deleteUserButton').addEventListener('click', deleteUser)
document.getElementById('newUserButton').addEventListener('click', createNewUser)
document.getElementById('showAll').addEventListener('click', showAll)
document.getElementById('loginButton').addEventListener('click', logIn)
document.getElementById('logoutButton').addEventListener('click', logOut)
document.getElementById('addTaskButton').addEventListener('click', addNewTask)