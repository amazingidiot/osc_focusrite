DEVICE_NAMES = []

var host, port, error = false

if (settings.read('send')) {
    [host, port] = settings.read('send')[0].split(':')
} else {
    console.warn('(WARNING) "send" option not set')
    error = true
}

// Shorthand for osc sending to ardour

_send = (address, ...args)=>{
    if (!error) send(host, port, address, ...args)
}

// Shorthand for osc sending to client

_receive = (address, ...args)=>{
    receive(host, port, address, ...args)
}

function updateDeviceSelectionList ( ) {
    // Create widgets and add to list widget

    var widgets = []

    for (let i = 0; i < DEVICE_NAMES.length; i++) {
        widgets.push(
                {
                    type: 'button',
                    mode: 'tap',
                    padding: -1,
                    expand: false,
                    alphaStroke: 0,
                    alphaFillOff: 0.15,
                    linkId: '>> closeModal',
                    id: 'button_device_' + i,
                    label: DEVICE_NAMES[i].name,
                    address: '/alsa/device/' + DEVICE_NAMES[i].index,
                    preArgs: '',
                    doubleClick: true,
                    on: ''
                }
        )

    }

    _receive('/EDIT', 'panel_deviceselection', {
        widgets: widgets,
    })
}

module.exports = {

    init: function(){
        // this will be executed once when the osc server starts
    },

    oscInFilter:function(data){
        // Filter incoming osc messages

        var {address, args, host, port} = data

        // do what you want

        // address = string
        // args = array of {value, type} objects
        // host = string
        // port = integer
        
        console.log("Received " + address)

        if ( address === '/echo' ) {
            console.log('Received echo from ' + host + ':' + port);

            return;
        }

        if ( address === '/alsa/device' ) {
            console.log('Received device:');
            console.log('Index: ' + args[0].value)
            console.log('ID: ' + args[1].value)
            console.log('Name: ' + args[2].value)
            console.log('Mixername: ' + args[3].value)
            console.log('Longname: ' + args[4].value)
            console.log('Driver: ' + args[5].value)
            console.log('Components: ' + args[6].value)

            DEVICE_NAMES.push(
                {
                    'index': args[0].value,
                    'id': args[1].value,
                    'name': args[2].value,
                    'mixername': args[3].value,
                    'longname': args[4].value,
                    'driver': args[5].value,
                    'components':  args[6].value
                }
            )

            updateDeviceSelectionList()

            return;
        }

        // return data if you want the message to be processed
        return {address, args, host, port}

    },

    oscOutFilter:function(data){
        // Filter outgoing osc messages

        var {address, args, host, port, clientId} = data

        console.log("Sent " + address)

        // same as oscInFilter

        if ( address === '/alsa/device' ) {
            console.log('Refreshing device list')

            DEVICE_NAMES = []

            updateDeviceSelectionList()
        }

        // return data if you want the message to be and sent
        return {address, args, host, port}
    },

    unload: function(){
        // this will be executed when the custom module is reloaded
    },

}
