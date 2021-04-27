function requestResponse(){
    if(this.responseText === ''){
        console.log('user does not exist')
        loginError()
    }else if(this.responseText === 'update'){
        console.log('updated')
    }else{
        castDashboard(this.responseText)
    }
}

let info
let url = window.location.href

function loginError(){
    document.getElementById('usernameInput').style.border = '1px solid red'
    document.getElementById('passwordInput').style.border = '1px solid red'
    document.getElementById('loginErrorMessage').innerHTML = 'Incorrect login, check if you got password and username right'
    document.getElementById('loginErrorMessage').style.color = 'red'
}

function castDashboard(userData){
    
    clearAll()

    let data = JSON.parse(userData)
    console.log(data)
    document.getElementById('loginButton').removeEventListener('click', logIn)
    document.getElementById('mainDiv').style.display = 'none'
    document.getElementById('dashboard').style.display = 'flex'
    
    info = data
    
    document.getElementById('userName').innerText = data.name
    document.getElementById('userImage').setAttribute('src', data.image)
    
    data.tasks.forEach((task)=>{
        
        
        //same beginning for all elements - div, head
        let newElement = document.createElement('div')
        let newHeading = document.createElement('h2')
        
        newElement.setAttribute('class', 'tasksContainer')
        newHeading.setAttribute('class', 'taskHeading')
        newHeading.classList.add('edit')
        
        
        document.getElementById('notesContainer').appendChild(newElement)
        newElement.appendChild(newHeading)
        
        newHeading.innerHTML = task.name
        
        //unique filling for an element
        switch(task.type){
            case 'regular':
                console.log('regular task')
                let newDescription = document.createElement('p')
                newDescription.setAttribute('class', 'taskDescription')
                newDescription.classList.add('edit')
                newElement.appendChild(newDescription)
                newDescription.innerHTML = task.description
                break;
            case 'timed':
                console.log('timed task')
                let newTimedContainer = document.createElement('div')
                newElement.appendChild(newTimedContainer)
                let newTimedDescription = document.createElement('p')
                newTimedDescription.setAttribute('class', 'taskDescription')
                newTimedDescription.classList.add('edit')
                newTimedContainer.appendChild(newTimedDescription)
                newTimedDescription.innerHTML = task.description
                let newProgresionContainer = document.createElement('div')
                newProgresionContainer.setAttribute('class', 'progressionContainer')
                newTimedContainer.appendChild(newProgresionContainer)
                let newTimer = document.createElement('span')
                newProgresionContainer.appendChild(newTimer)
                newTimer.setAttribute('class', 'taskTimer')
                let newProgressionBar = document.createElement('div')
                newProgressionBar.setAttribute('class', 'timedProgression')
                newProgresionContainer.appendChild(newProgressionBar)
                let beginning = parseInt(Date.parse(JSON.parse(task.typeInfo)[1]))
                let time = parseInt(JSON.parse(task.typeInfo)[0])
                let endTime = beginning + time
                
                renderTime(beginning, time, endTime, newTimer)
                break;
            case 'count':
                console.log('counter task')
                let newCountDescription = document.createElement('div')
                newCountDescription.setAttribute('class', 'taskDescription')
                newCountDescription.classList.add('edit')
                newElement.appendChild(newCountDescription)
                newCountDescription.innerHTML = task.description
                let newCounterContainer = document.createElement('div')
                newCounterContainer.setAttribute('class', 'counterContainer')
                newElement.appendChild(newCounterContainer)
                let minusCounter = document.createElement('button')
                minusCounter.setAttribute('class', 'counterMinus')
                minusCounter.classList.add('counterBtn')
                minusCounter.innerHTML = '-'
                minusCounter.addEventListener('click', subFromTaskCount)
                let plusCounter = document.createElement('button')
                plusCounter.setAttribute('class', 'counterPlus')
                plusCounter.classList.add('counterBtn')
                plusCounter.innerHTML = '+'
                plusCounter.addEventListener('click', addToTaskCount)
                newCounterContainer.appendChild(minusCounter)
                let newCount = document.createElement('span')
                newCounterContainer.appendChild(newCount)
                newCount.setAttribute('class', 'counterTaskSpan')
                newCount.innerHTML = task.typeInfo
                newCounterContainer.appendChild(plusCounter)
                break;
            case 'list':
                let newList = document.createElement('ul')
                newElement.appendChild(newList)
                let item = JSON.parse(task.typeInfo)
                for(let i=0; i<item.length; i++){
                    let newListItem = document.createElement('li')
                    let newListItemStatus = document.createElement('input')
                    let newListItemContainer = document.createElement('div')
                    newList.appendChild(newListItemContainer)
                    newListItemStatus.setAttribute('type', 'checkbox')
                    newListItem.classList.add('taskDescription')
                    newListItemContainer.appendChild(newListItemStatus) 
                    newListItemContainer.appendChild(newListItem)
                    newListItem.innerHTML = item[i].task
                    newListItemStatus.checked = item[i].state
                    if(newListItemStatus.checked){
                        newListItem.style.textDecoration = 'line-through'
                    }
                    newListItemStatus.addEventListener('change', listItemStatusChange)
                }
                break;
        }
        
        //same ending for all elements - remove ,edit, date ,id
        
        let newDate = document.createElement('p')
        let newRemoveButton = document.createElement('button')
        let newId = document.createElement('p')
        let newEditButton = document.createElement('button')  
        
        newDate.setAttribute('class', 'taskDate')
        newRemoveButton.addEventListener('click', removeNote)
        newRemoveButton.innerHTML = 'REMOVE'
        newRemoveButton.setAttribute('class', 'removeButton')
        newRemoveButton.classList.add('redButton')
        newId.setAttribute('class', 'noteId')
        newEditButton.setAttribute('class', 'editButton')
        newEditButton.classList.add('grayButton')
        newEditButton.addEventListener('click', editNote)
        newEditButton.innerHTML = "EDIT"
        
        newElement.appendChild(newDate)
        newElement.appendChild(newId)
        newElement.appendChild(newRemoveButton)
        newElement.appendChild(newEditButton)
        
        newDate.innerHTML = task.date
        newId.innerHTML = task.id
        newId.setAttribute('class', 'noteId')
        
        var filters = document.querySelectorAll('.filterInput')
        console.log(filters)
        for(let i=0; i<filters.length; i++){
            if(filters[i].checked && filters[i].defaultValue != 'all'){
                console.log(filters[i].defaultValue)
                filterItems(filters[i].defaultValue)
            }
        }
    })
}

function listItemStatusChange(){
    let noteId = parseInt(this.parentElement.parentElement.children.item(3).innerHTML)
    let target = findPositionInLi(this)
    
    let task = findTaskPosition(this)
    
    let newTypeInfo = JSON.parse(info.tasks[task].typeInfo)
    
    if(this.checked == true){
        this.previousElementSibling.style.textDecoration = 'line-through'
        
        newTypeInfo[target].state = true

        xhr.open('PUT', url+'updateChecklist/'+info._id, true)
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        xhr.send('typeInfo='+JSON.stringify(newTypeInfo)+'&id='+noteId+'&target='+target)
    }else if(this.checked == false){
        this.previousElementSibling.style.textDecoration = 'none'
        
        newTypeInfo[target].state = false
    
        xhr.open('PUT', url+'updateChecklist/'+info._id, true)
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        xhr.send('typeInfo='+JSON.stringify(newTypeInfo)+'&id='+noteId+'&target='+target)
    }
}

function findTaskPosition(target){
    for(let i = 0; i<info.tasks.length; i++){
        if(info.tasks[i].name == target.parentElement.parentElement.children.item(0).innerHTML){
            return i
        }
    }
}

function findPositionInLi(target){
    let allListItems = target.parentElement.parentElement.querySelectorAll('li')
    for(let i =0; i<allListItems.length; i++){
        if(target.previousSibling == allListItems[i]){
           return i
        }
    }
}

function subFromTaskCount(){
    let newValue = parseInt(this.parentElement.children.item(1).innerHTML) - 1
    if(newValue>=0){
        this.parentElement.children.item(1).innerHTML = newValue
        let target = parseInt(this.parentElement.parentElement.querySelector('.noteId').innerHTML)
        updateTaskCounter(newValue, target)   
    }
}

function addToTaskCount(){
    let newValue = parseInt(this.parentElement.children.item(1).innerHTML) + 1
    if(newValue>=0){
        this.parentElement.children.item(1).innerHTML = newValue
        let target = parseInt(this.parentElement.parentElement.querySelector('.noteId').innerHTML)
        updateTaskCounter(newValue, target)   
    }
}

function updateTaskCounter(newValue, target){
    xhr.open('PUT', url+"updateCount/"+info._id, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send('count='+newValue+'&id='+target)
}

function renderTime(beginning, time, endTime, target){
    
    let currentTime = new Date()
    let timeLeft = (endTime-Date.parse(currentTime))
     
    if(timeLeft>0){
        let timer = setInterval(()=>{
            if(timeLeft>0){
                
                currentTime = new Date()
                timeLeft = (endTime-Date.parse(currentTime))      
                let secondsLeft = ((endTime-Date.parse(currentTime))/1000)%60
                let minutesLeft = (Math.floor((timeLeft/1000)/60))%60
                let hoursLeft = Math.floor(Math.floor((timeLeft/1000)/60)/60)
                target.innerHTML = hoursLeft  + 'hr '+ minutesLeft  + 'min '+ secondsLeft.toFixed(0) + 'sec'
                let procentLeft =  Math.floor(100 - timeLeft/(time/100))
                target.nextElementSibling.style.width = procentLeft + '%'
            }else{
                clearInterval(timer)
                target.innerHTML = "Time out"
                target.style.color = 'white'
                target.nextElementSibling.style.width = '100%'
                target.nextElementSibling.style.backgroundColor = '#ff8080'
            }
        }, 1000)
    }else{
        
        target.innerHTML = "Time out"
        target.style.color = 'white'
        target.nextElementSibling.style.width = '100%'
        target.nextElementSibling.style.backgroundColor = '#ff8080'
    }
}

//Editing a note
function editNote(){
    console.log(this.parentElement.querySelectorAll('.edit'))
    var editableElements = this.parentElement.querySelectorAll('.edit')
    this.parentElement.lastElementChild.style.display = 'none' //removes "edit" button to be replaced by "save"
    for(let i=0; i<editableElements.length; i++){
        editableElements[i].setAttribute('contenteditable', true)
        editableElements[i].style.border = '1px solid gray'
    }
    this.parentElement.style.border = '2px solid black'
    this.parentElement.children.item(0).focus()
    addSaveButton(this.parentElement)
    
}

function addSaveButton(note){
    let newSaveButton = document.createElement('button')
    newSaveButton.innerHTML = "SAVE"
    newSaveButton.setAttribute('id', 'saveButton')
    newSaveButton.classList.add('grayButton')
    note.appendChild(newSaveButton)
    newSaveButton.addEventListener('click', saveNote)
}

function saveNote(note){
    var editableElements = this.parentElement.querySelectorAll('.edit')
    for(let i=0; i<editableElements.length; i++){
        editableElements[i].setAttribute('contenteditable', false)
        editableElements[i].style.border = 'none'
    }
    this.parentElement.style.border = '1px solid gray'
    this.parentElement.children.item(this.parentElement.childElementCount -2).style.display = 'inline'
    
    let newTitle = this.parentElement.children.item(0).innerHTML
    let newDescription = this.parentElement.querySelector('.taskDescription').innerHTML
    let noteId = this.parentElement.querySelector('.noteId').innerHTML
    
    this.removeEventListener('click', saveNote)
    this.remove()
    
    xhr.open('PUT', url+'update/'+info._id, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send('name='+newTitle+'&description='+newDescription+'&id='+noteId)
}


function removeNote(){
    this.parentElement.remove()
    let noteId = this.parentElement.querySelector('.noteId').innerHTML
    
    xhr.open('DELETE', url+'users/'+info._id, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send('id='+noteId)
}


function clearAll(){
    while(document.getElementById('notesContainer').firstChild){
        document.getElementById('notesContainer').removeChild(document.getElementById('notesContainer').firstChild)
    }
}


let xhr = new XMLHttpRequest()

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

let type = 'regular'

function noteType(){
    var regular = document.getElementById('regularNote')
    var timed = document.getElementById('timedNote')
    var count = document.getElementById('countNote')
    var list = document.getElementById('listNote')
    
    if(regular.checked){
        type = 'regular'
    }else if(timed.checked){
        type = 'timed'
    }else if(count.checked){
        type = 'count'
    }else if(list.checked){
        type = 'list'
    }
    
    drawTypeSelection(type)
}

function drawTypeSelection(type){
    switch(type){
        case 'timed':
            clearInputType()
            document.getElementById('typeSpecifications').style.display = 'flex'
            document.getElementById('typeInputDescription').innerHTML = 'Input time'
            document.getElementById('timeValue').style.display = 'inline'
            document.getElementById('typeSpecValue').style.display = 'inline'
            document.getElementById('typeSpecValue').setAttribute('type', 'number')
            document.getElementById('typeInputList').style.display ='flex'
            break;
        case 'count':
            clearInputType()
            document.getElementById('typeSpecifications').style.display = 'flex'
            document.getElementById('typeInputDescription').innerHTML = 'Input amount'
            document.getElementById('counterValue').style.display = 'inline'
            document.getElementById('typeSpecValue').style.display = 'none'
            break;
        case 'list':
            clearInputType()
            document.getElementById('typeSpecValue').style.display = 'inline'
            document.getElementById('typeSpecifications').style.display = 'flex'
            document.getElementById('typeInputDescription').innerHTML = 'Input list items'
            document.getElementById('listValue').style.display = 'inline'
            document.getElementById('typeSpecValue').setAttribute('type', 'text')
            document.getElementById('newTaskDescription').style.display = 'none'
            document.getElementById('newTaskDescriptionLabel').style.display = 'none'
            document.getElementById('typeInputList').style.display = 'flex'
            break;
        default:
            clearInputType()
            break;
    }
        
}

function counter(e){
    let amount = parseInt(document.getElementById('counterSpan').innerHTML)  
    if(e.target.innerHTML == '+'){
        amount++
    }else if(e.target.innerHTML =='-' && amount>1){
        amount--
    }
    document.getElementById('counterSpan').innerHTML = amount
}

function clearInputType(){
    document.getElementById('typeInputList').style.display ='none'
    document.getElementById('typeSpecifications').style.display = 'none'
    document.getElementById('timeValue').style.display = 'none'
    document.getElementById('counterValue').style.display = 'none'
    document.getElementById('listValue').style.display = 'none'
    document.getElementById('newTaskDescription').style.display = 'block'
    document.getElementById('newTaskDescriptionLabel').style.display = 'block'
    while(document.getElementById('typeInputList').lastElementChild != document.getElementById('typeSpecValue')){
        document.getElementById('typeInputList').removeChild(document.getElementById('typeInputList').lastChild)
    }
}

let timeUnit = function(){
    if(document.getElementById('timeUnitSelection').value == 'sec'){
        return 1000
    }else if(document.getElementById('timeUnitSelection').value == 'min'){
        return 60000
    }else if(document.getElementById('timeUnitSelection').value == 'hr'){
        return 3600000
    }
}

function addItemToList(){
    let newInputField = document.createElement('input')
    newInputField.setAttribute('class', 'listInputField')
    newInputField.classList.add('textInput')
    newInputField.style.width = '100%'
    newInputField.style.marginTop = '20px'
    document.getElementById('typeInputList').appendChild(newInputField)
}


function ListItem(task, state){
    this.task = task
    this.state = state
}

function addNewTask(){
    let taskName = document.getElementById('newTasksName').value
    let taskDescription = document.getElementById('newTaskDescription').value
    let id = Date.parse(new Date)
    let typeInfo = null
    
    switch(type){
        case 'timed':
            typeInfo = [parseInt(document.getElementById('typeSpecValue').value) * timeUnit(), new Date()]
            break;
        case 'count':
            typeInfo = parseInt(document.getElementById('counterSpan').innerHTML)
            break;
        case 'list':
            typeInfo = []
            for(let i = 0; i<document.querySelectorAll('.listInputField').length; i++){
                let newItem = new ListItem(document.querySelectorAll('.listInputField')[i].value, false)
                typeInfo.push(newItem)
                console.log(typeInfo)
            }
            break;
        default:
            typeInfo = null
        break;
    }

    xhr.open('PUT', url+"newTask/"+info._id, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send('name='+taskName+'&description='+taskDescription+'&id='+id+'&type='+type+'&typeInfo='+JSON.stringify(typeInfo))
    
}

function userRegistrationResponse(){
    if(this.response == ''){
        nameError()
    }else{
        closeRegistration() 
    }
}

function createNewUser(){
    closeRecovery()
    document.getElementById('registerForm').style.display = 'flex'
    document.getElementById('registerUserButton').addEventListener('click', sendNewUser)
    document.getElementById('cancleRegistration').addEventListener('click', closeRegistration)
}

function sendNewUser(){
    let newUserName = document.getElementById('newUserName').value
    let newUserPassword = document.getElementById('newUserPassword').value
    let newUserPasswordRepeat = document.getElementById('newUserPasswordRepeat').value
    let newUserEmail = document.getElementById('newUserEmail').value

    document.getElementById('usernameError').style.display = 'none'
    document.getElementById('differentPasswordError').style.display='none'
    document.getElementById('newUserPassword').style.border = 'none'
    document.getElementById('newUserPasswordRepeat').style.border = 'none'
    
    if(checkNewPassword(newUserPassword, newUserPasswordRepeat) && newUserName != ''){
        xhr.open('POST', url, true)
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        xhr.addEventListener('load', userRegistrationResponse)
        xhr.send('name='+newUserName+'&password='+newUserPassword+'&email='+newUserEmail) 
         
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

function changeFilter(){
    let filterBy = this.value
    switch(filterBy){
        case 'all':
            console.log('show all')
            castDashboard(JSON.stringify(info))
            break;
        case 'regular':
            console.log('filter by regular type')
            filterItems('regular')
            break;
        case 'timed':
            console.log('filter by timed type')
            filterItems('timed')
            break;
        case 'count':
            console.log('filter by counter type')
            filterItems('count')
            break;
        case 'list':
            console.log('filter by list type')
            filterItems('list')
            break;
        default:
            console.log('show all type')
            castDashboard(JSON.stringify(info))
    }
    
}

function filterItems(type){
    clearAll()
    let allTasks = info.tasks

    for(let i=0; i<allTasks.length; i++){
        if(allTasks[i].type == type){
            //same beginning for all elements - div, head
        let newElement = document.createElement('div')
        let newHeading = document.createElement('h2')
        
        newElement.setAttribute('class', 'tasksContainer')
        newHeading.setAttribute('class', 'taskHeading')
        newHeading.classList.add('edit')
        
        document.getElementById('notesContainer').appendChild(newElement)
        newElement.appendChild(newHeading)
        
        newHeading.innerHTML = allTasks[i].name
        
        //unique filling for an element
        switch(type){
            case 'regular':
                console.log('regular task')
                let newDescription = document.createElement('p')
                newDescription.setAttribute('class', 'taskDescription')
                newDescription.classList.add('edit')
                newElement.appendChild(newDescription)
                newDescription.innerHTML = allTasks[i].description
                break;
            case 'timed':
                console.log('timed task')
                let newTimedContainer = document.createElement('div')
                newElement.appendChild(newTimedContainer)
                let newTimedDescription = document.createElement('p')
                newTimedDescription.setAttribute('class', 'taskDescription')
                newTimedDescription.classList.add('edit')
                newTimedContainer.appendChild(newTimedDescription)
                newTimedDescription.innerHTML = allTasks[i].description
                let newTimer = document.createElement('span')
                newTimedContainer.appendChild(newTimer)
                newTimer.setAttribute('class', 'taskTimer')
                
                let beginning = parseInt(Date.parse(JSON.parse(allTasks[i].typeInfo)[1]))
                let time = parseInt(JSON.parse(allTasks[i].typeInfo)[0])
                let endTime = beginning + time
                
                renderTime(beginning, time, endTime, newTimer)
                break;
            case 'count':
                console.log('counter task')
                let newCounterContainer = document.createElement('div')
                newCounterContainer.setAttribute('class', 'counterContainer')
                newElement.appendChild(newCounterContainer)
                let newCountDescription = document.createElement('div')
                newCountDescription.setAttribute('class', 'taskDescription')
                newCountDescription.classList.add('edit')
                newElement.appendChild(newCountDescription)
                newCountDescription.innerHTML = allTasks[i].description
                let minusCounter = document.createElement('button')
                minusCounter.setAttribute('class', 'counterMinus')
                minusCounter.classList.add('counterBtn')
                minusCounter.innerHTML = '-'
                minusCounter.addEventListener('click', subFromTaskCount)
                let plusCounter = document.createElement('button')
                plusCounter.setAttribute('class', 'counterPlus')
                plusCounter.classList.add('counterBtn')
                plusCounter.innerHTML = '+'
                plusCounter.addEventListener('click', addToTaskCount)
                newCounterContainer.appendChild(minusCounter)
                let newCount = document.createElement('span')
                newCounterContainer.appendChild(newCount)
                newCount.innerHTML = allTasks[i].typeInfo
                newCount.setAttribute('class', 'counterTaskSpan')
                newCounterContainer.appendChild(plusCounter)
                break;
            case 'list':
                let newList = document.createElement('ul')
                newElement.appendChild(newList)
                let item = JSON.parse(allTasks[i].typeInfo)
                for(let i=0; i<item.length; i++){
                    let newListItem = document.createElement('li')
                    let newListItemStatus = document.createElement('input')
                    newListItemStatus.setAttribute('type', 'checkbox')
                    newList.appendChild(newListItem)
                    newListItem.classList.add('taskDescription')
                    newList.appendChild(newListItemStatus)               
                    newListItem.innerHTML = item[i].task
                    newListItemStatus.checked = item[i].state
                    if(newListItemStatus.checked){
                        newListItem.style.textDecoration = 'line-through'
                    }
                    newListItemStatus.addEventListener('change', listItemStatusChange)
                }
                break;
        }
        
        //same ending for all elements - remove ,edit, date ,id
        
        let newDate = document.createElement('p')
        let newRemoveButton = document.createElement('button')
        let newId = document.createElement('p')
        let newEditButton = document.createElement('button')  
        
        newDate.setAttribute('class', 'taskDate')
        newRemoveButton.addEventListener('click', removeNote)
        newRemoveButton.innerHTML = 'REMOVE'
        newRemoveButton.setAttribute('class', 'removeButton')
        newId.setAttribute('class', 'noteId')
        newEditButton.setAttribute('class', 'editButton')
        newEditButton.addEventListener('click', editNote)
        newEditButton.innerHTML = "EDIT"
        
        newElement.appendChild(newDate)
        newElement.appendChild(newId)
        newElement.appendChild(newRemoveButton)
        newElement.appendChild(newEditButton)
        
        newDate.innerHTML = allTasks[i].date
        newId.innerHTML = allTasks[i].id
        newId.setAttribute('class', 'noteId')
        }
    }
}

let filterInput  = document.querySelectorAll('.filterInput')
for(let i = 0; i<filterInput.length; i++){
    filterInput[i].addEventListener('change', changeFilter)
}

//password recovery 

function openRecovery(){
    closeRegistration()
    document.getElementById('recoveryForm').style.display = 'flex'
    document.getElementById('recoveryCancelButton').addEventListener('click', closeRecovery)
    document.getElementById('recoverySendButton').addEventListener('click', sendRecovery)
}

function closeRecovery(){
    document.getElementById('recoveryCancelButton').removeEventListener('click', closeRecovery)
    document.getElementById('recoverySendButton').removeEventListener('click', sendRecovery)
    document.getElementById('recoveryForm').style.display = 'none'
    xhr.removeEventListener('load', emailRecoveryConformation)
}

function sendRecovery(){
    let email = document.getElementById('recoveryEmailInput').value
    xhr.open('PUT', url+'recovery', true)
    xhr.addEventListener('load', emailRecoveryConformation)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send('email='+email)
}
function emailRecoveryConformation(response){
    console.log(response)
    if(response.lengthComputable){
        alert('Recovery email sent')
        closeRecovery()
    }else{
        alert('User with such email does not exist')
    }
}

function mobileBurger(){
    console.log('burger do move')
    document.getElementById('userPanel').classList.toggle('userPanelIn')
    document.getElementById('mobileBurger').classList.toggle('burgerIn')
}


document.getElementById('mobileBurger').addEventListener('click', mobileBurger)

document.getElementById('addItemToListBtn').addEventListener('click', addItemToList)

document.getElementById('counterMinus').addEventListener('click', counter)
document.getElementById('counterPlus').addEventListener('click', counter)

document.getElementById('timedNote').addEventListener('click', noteType)
document.getElementById('regularNote').addEventListener('click', noteType)
document.getElementById('countNote').addEventListener('click', noteType)
document.getElementById('listNote').addEventListener('click', noteType)

document.getElementById('accountRecovery').addEventListener('click', openRecovery)
document.getElementById('uploadUserImageInput').addEventListener('change', uploadUserImage)
document.getElementById('changeUserImageButton').addEventListener('click', castImageChangeMenu)
document.getElementById('deleteUserButton').addEventListener('click', deleteUser)
document.getElementById('newUserButton').addEventListener('click', createNewUser)
document.getElementById('loginButton').addEventListener('click', logIn)
document.getElementById('logoutButton').addEventListener('click', logOut)
document.getElementById('addTaskButton').addEventListener('click', addNewTask)