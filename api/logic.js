const loader = require('./loader.js')

// noinspection SpellCheckingInspection
const CheckedInCustomerField = 'checkedincustomer'
// noinspection SpellCheckingInspection
const CheckedOutCustomerField = 'checkedoutcustomer'

// Only Used in logic
function getField(fieldName, defaultData) {
    let d = loader.getField(fieldName)
    if (d === undefined) {
        d = defaultData
        loader.saveField(fieldName, d)
        console.log("WARN: Field:" + fieldName + " is undefined,so default value assigned.")
    }
    return d
}


function addToArrayField(fieldName, data) {
    let d = loader.getField(fieldName)
    if (Array.isArray(d)) {
        d.push(data)
        loader.saveField(fieldName, d)
        return true
    } else {
        console.log("WARN:In addToArrayField,Field:" + fieldName + " is not Array Field!")
        loader.saveField(fieldName, [])
        let d = loader.getField(fieldName)
        d.push(data)
        loader.saveField(d)
        return true
    }
}

function removeFromArrayField(fieldName, data) {
    let d = loader.getField(fieldName)
    if (Array.isArray(d)) {
        if (d.includes(data)) {
            d.remove(data)
            return true
        }
        return undefined
    } else {
        console.log("WARN:In removeFromArrayField,Field:" + fieldName + " is not Array Field!")
        return undefined
    }
}

function getSectionDataField(fieldName, sectionName) {
    return fieldName + ':' + sectionName
}

function checkSection(sectionName) {
    let sections = loader.getSectionsData(sectionName)
    if (sections.length === 1) return true
    else if (sections.length === 0) return false
    return undefined
}

function isOnlyOnceSection(sectionName) {
    if (!checkSection(sectionName) || checkSection(sectionName) === undefined) return false
    let sections = loader.getSectionsData(sectionName)
    if (sections.length === 1) {
        let section = sections[0]
        return section["OnlyOnce"]
    } else {
        console.log("ERROR: More than 1 Section is matched! Section Name:" + sectionName)
        return false
    }
}

function getSectionOnlyOnceDataField(sectionName) {
    // noinspection SpellCheckingInspection
    return getSectionDataField('onlyonce', sectionName)
}

function markOnlyOnceSection(customerID, sectionName) {
    addToArrayField(getSectionOnlyOnceDataField(sectionName), {
        'QRID': customerID,
        'Time': Date.now().toLocaleString(),
        'Entered': true
    })
}

function isAlreadyEnteredOnlyOnceSection(customerID, sectionName) {
    if (!isOnlyOnceSection(sectionName)) return false
    let data = getField(getSectionOnlyOnceDataField(sectionName), undefined)
    if (data === undefined) {
        console.log("INFO:In isAlreadyEnteredOnlyOnceSection OnlyOnceDataField is undefined")
        return false
    } else {
        let d = data.filter(value => value['QRID'] === customerID)
        if (d.length === 0) {
            return false
        } else if (d.length === 1) {
            return d[0]['Entered']
        } else {
            console.log("ERROR:In isAlreadyEnteredOnlyOnceSection More than 1 OnlyOnceDataField is matched")
            return undefined
        }
    }
}

function checkIn(customerId, checkData, sectionName) {
    if (!loader.isValidTicket(customerId, checkData)) {
        return {
            'Status': 'ERROR',
            'Message': 'Ticket is not valid!'
        }
    }


    let check = checkSection(sectionName)
    if (check === undefined) {
        return {
            'Status': 'ERROR',
            'Message': 'Duplicated Section! SectionName:' + sectionName
        }
    } else if (!check) {
        return {
            'Status': 'ERROR',
            'Message': 'No Such Section is registered! SectionName:' + sectionName
        }
    }
    let customer = loader.getCustomerData(customerId)
    if (customer.length === 0) {
        let stuff = loader.getStuffData(customerId)
        if (stuff.length === 0) {
            return {
                'Status': 'ERROR',
                'Message': 'No Such Customer or Stuff is registered!'
            }
        } else if (stuff.length === 1) {
            let data = {
                'QRID': customerId,
                'Time': Date.now().toLocaleString()
            }
            let add = addToArrayField(getSectionDataField(CheckedInCustomerField, sectionName), data)
            if (!add) {
                return {
                    'Status': 'INTERNAL ERROR'
                }
            }
            return {
                'Status': 'SUCCESS',
                'Data': data
            }
        } else {
            console.log("ERROR:In checkIn ID:" + customerId + " Section:" + sectionName + " More than 1 Stuff is matched!")
            return {
                'Status': 'INTERNAL ERROR'
            }
        }
    } else if (customer.length === 1) {
        if (!customer[0]['Sections'].map(value => value['SectionName']).includes(sectionName)) {
            return {
                'Status': 'ERROR',
                'Message': 'The Customer Can\'t go into this section.'
            }
        }

        let section = customer[0]['Sections'].filter(value => value['SectionName'].includes(sectionName))[0]
        if (!section['TimeFunction']) {
            return {
                'Status': 'ERROR',
                'Message': 'The Customer Can\'t go into this section. During this Time.'
            }
        }

        if (isOnlyOnceSection(sectionName)) {
            if (isAlreadyEnteredOnlyOnceSection(customer[0]['QRID'], sectionName)) {
                return {
                    'Status': 'ERROR',
                    'Message': 'The Customer has been into this section.(this section is Only-Once Section.)'
                }
            } else {
                markOnlyOnceSection(customer[0]['QRID'], sectionName)
            }
        }


        if (customer[0]['Day'].includes(loader.getCurrentDate())) {
            let data = {
                'QRID': customerId,
                'Time': Date.now().toLocaleString()
            }
            let add = addToArrayField(getSectionDataField(CheckedInCustomerField, sectionName), data)
            if (!add) {
                return {
                    'Status': 'INTERNAL ERROR'
                }
            }
            return {
                'Status': 'SUCCESS',
                'Data': data
            }
        } else {
            return {
                'Status': 'ERROR',
                'Message': 'That Customer is planned to check in at Day' + customer[0]['Day'] + " Current is:" + loader.getCurrentDate()
            }
        }
    } else {
        console.log("ERROR:In checkIn ID:" + customerId + " Section:" + sectionName + " More than 1 Customer is matched!")
        return {
            'Status': 'INTERNAL ERROR'
        }
    }
}

function checkOut(customerId, checkData, sectionName) {
    if (!loader.isValidTicket(customerId, checkData)) {
        return {
            'Status': 'ERROR',
            'Message': 'Ticket is not valid!'
        }
    }


    let check = checkSection(sectionName)
    if (check === undefined) {
        return {
            'Status': 'ERROR',
            'Message': 'Duplicated Section! SectionName:' + sectionName
        }
    } else if (!check) {
        return {
            'Status': 'ERROR',
            'Message': 'No Such Section is registered! SectionName:' + sectionName
        }
    }
    let customer = loader.getCustomerData(customerId)
    if (customer.length === 0) {
        let stuff = loader.getStuffData(customerId)
        if (stuff.length === 0) {
            return {
                'Status': 'ERROR',
                'Message': 'No Such Customer or Stuff is registered!'
            }
        } else if (stuff.length === 1) {
            let data = {
                'QRID': customerId,
                'Time': Date.now().toLocaleString()
            }
            let add = addToArrayField(getSectionDataField(CheckedOutCustomerField, sectionName), data)
            if (!add) {
                return {
                    'Status': 'INTERNAL ERROR'
                }
            }
            return {
                'Status': 'SUCCESS',
                'Data': data
            }
        } else {
            console.log("ERROR:In checkIn ID:" + customerId + " Section:" + sectionName + " More than 1 Stuff is matched!")
            return {
                'Status': 'INTERNAL ERROR'
            }
        }
    } else {
        let data = {
            'QRID': customerId,
            'Time': Date.now().toLocaleString()
        }
        let remove = removeFromArrayField(getSectionDataField(CheckedInCustomerField, sectionName), data)
        if (remove === undefined) {
            return {
                'Status': 'ERROR',
                'Message': 'No Such Customer hasn\'t entered!'
            }
        } else if (!remove) {
            return {
                'Status': 'INTERNAL ERROR'
            }
        }
        let add = addToArrayField(getSectionDataField(CheckedOutCustomerField, sectionName), data)
        if (!add) {
            return {
                'Status': 'INTERNAL ERROR'
            }
        }
        return {
            'Status': 'SUCCESS',
            'Data': data
        }
    }
}

function getCheckedInCustomersInSection(sectionName) {
    let data = loader.getField(getSectionDataField(CheckedInCustomerField, sectionName))
    if (data === undefined) {
        console.log("WARN:In getCheckedInCustomersInSection Field:" + getSectionDataField(CheckedInCustomerField, sectionName) + " is undefined!")
        return undefined
    } else {
        return data
    }
}

function getCheckedOutCustomersInSection(sectionName) {
    let data = loader.getField(getSectionDataField(CheckedOutCustomerField, sectionName))
    if (data === undefined) {
        console.log("WARN:In getCheckedInCustomersInSection Field:" + getSectionDataField(CheckedOutCustomerField, sectionName) + " is undefined!")
        return undefined
    } else {
        return data
    }
}

module.exports = {
    loader,
    checkIn,
    checkOut,
    checkSection,
    getCheckedInCustomersInSection,
    getCheckedOutCustomersInSection
}