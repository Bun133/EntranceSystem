// This is loader file,
// You may need to change/write some code to read data from Your DB.
// This file is defaulted to return dummy data


// Returns List of Customer Json
// Default is Dummy Data
//
// Needed Field:
// Display Name:Name that will be shown
// QRID:Data contained Customer's ticket or something like that
// Day:Which day the customer have right to attend
// Section:Which section the customer can go into
function syncCustomers() {
    return [
        {
            'DisplayName': 'Dummy1',
            'QRID': '0001',
            'Day': [1],
            'Sections':['Section1','Section2']
        },
        {
            'DisplayName': 'Dummy2',
            'QRID': '0002',
            'Day': [1],
            'Sections':['Section1']
        },
        {
            'DisplayName': 'Dummy3',
            'QRID': '0003',
            'Day': [2],
            'Sections':['Section1']
        },
    ]
}


// Returns List of Stuff Json
// Default is Dummy Data
//
// Needed Field:
// DisplayName:name that will be shown
// QRID:Data contained Stuff's ticket or something like that
function syncStuffs() {
    return [{
        'DisplayName': 'DummyStuff1',
        'QRID': 'STUFF1'
    }]
}

// Returns List of Sections
//Default is Dummy Data
// Needed Field:
// DisplayName:name of section
// OnlyOnce: if the section is Only-Once section
function syncSections() {
    return [
        {
            'DisplayName': 'Section1',
            'OnlyOnce' : false
        },
        {
            'DisplayName': 'Section2',
            'OnlyOnce' : true
        },
    ]
}

//DUMMY
let dummyDataMap = new Map()

// Save Data to the exact field
// This method is needed to save many data safely to run the system.
//
// Needed Method:
// Save Data Safely ( maybe to DB )
function saveField(fieldName, data) {
    //DUMMY
    dummyDataMap.set(fieldName, data)
}

// Get Data from the field
// This method is needed to read many data safely to run the system.
//
// Needed Method:
// Get Data Safely ( maybe from DB )
//
// Tips:
// You can return undefined when not set.
function getField(fieldName) {
    return dummyDataMap.get(fieldName)
}

// Get Day Method
// This method returns day of now
//
// Needed Method:
// Return Current Day
//
// Dummy:
// returns 1
function getCurrentDate() {
    return 1
}

module.exports = {syncCustomers, syncStuffs, syncSections, saveField, getField, getCurrentDate}