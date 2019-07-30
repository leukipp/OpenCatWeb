'use strict';

let log = ocw.Log();
let api = ocw.Api();

let j = ocw.status.J();
j.readStatus().done((status) => {
    let m = status.map((value, index) => ocw.move.M(index, value));

    let vue = new Vue({
        el: '#app',
        data: () => {
            let data = {
                page: 1,
                menuOpen: false,
                menuOpenPage: (e) => {
                    vue.$data.page = parseInt($(e.target).closest('.menu-item').attr('class').split('-')[2]);
                    vue.$data.menuOpen = false;
                },
                buttonCommand: (e) => {
                    ocw.Command(($(e.target).closest('.button').attr('id'))).writeCommand();
                },
                actionCommand: (e) => {
                    ocw.Command(($(e.target).closest('.action').attr('id'))).writeCommand();
                },
                lazyUpdate: true,
                lazyUpdateChange: () => {
                    m.forEach((item) => vue.$data['b' + item.getIndex()].lazy = vue.$data.lazyUpdate);
                },
                autoUpdate: false,
                autoUpdateRate: (rate) => {
                    setTimeout(() => {
                        if (vue.$data.autoUpdate) {
                            j.readStatus().done((status) => {
                                status.forEach((value, index) => {
                                    m[index].setValue(value);
                                    vue.$refs['m' + index][0].setValue(value);
                                });
                                vue.$data.autoUpdateRate(rate);
                            });
                        } else {
                            vue.$data.autoUpdateRate(rate);
                        }
                    }, rate);
                },
                command: '',
                commandWrite: () => {
                    if (vue.$data.command) {
                        ocw.Command(vue.$data.command).writeCommand();
                    }
                },
                buttons: [
                    {
                        name: 'Rest',
                        command: 'krest'
                    },
                    {
                        name: 'Sit',
                        command: 'ksit'
                    },
                    {
                        name: 'Stand',
                        command: 'kbalance'
                    },
                    {
                        name: 'Butt',
                        command: 'kbuttUp'
                    },
                    {
                        name: 'Pee',
                        command: 'kpee'
                    },
                    {
                        name: 'Stretch',
                        command: 'kstr'
                    }
                ],
                sliders: [
                    {
                        id: 0,
                        name: 'hPan',
                        direction: 'rtl',
                        min: -60,
                        max: 60
                    },
                    {
                        id: 1,
                        name: 'hTilt',
                        direction: 'rtl',
                        min: -80,
                        max: 50
                    },
                    {
                        id: 2,
                        name: 'tPan',
                        direction: 'rtl',
                        min: -60,
                        max: 60
                    },
                    {
                        id: 3,
                        name: 'N/A',
                        direction: 'rtl',
                        min: -60,
                        max: 60
                    },
                    {
                        id: 4,
                        name: 'rFL',
                        direction: 'rtl',
                        min: -60,
                        max: 60
                    },
                    {
                        id: 5,
                        name: 'rFR',
                        direction: 'rtl',
                        min: -60,
                        max: 60
                    },
                    {
                        id: 6,
                        name: 'rHR',
                        direction: 'rtl',
                        min: -60,
                        max: 60
                    },
                    {
                        id: 7,
                        name: 'rHL',
                        direction: 'rtl',
                        min: -60,
                        max: 60
                    },
                    {
                        id: 8,
                        name: 'sFL',
                        direction: 'rtl',
                        min: -60,
                        max: 90
                    },
                    {
                        id: 9,
                        name: 'sFR',
                        direction: 'rtl',
                        min: -60,
                        max: 90
                    },
                    {
                        id: 10,
                        name: 'sHR',
                        direction: 'rtl',
                        min: -90,
                        max: 60
                    },
                    {
                        id: 11,
                        name: 'sHL',
                        direction: 'rtl',
                        min: -90,
                        max: 60
                    },
                    {
                        id: 12,
                        name: 'kFL',
                        direction: 'rtl',
                        min: -60,
                        max: 60
                    },
                    {
                        id: 13,
                        name: 'kFR',
                        direction: 'rtl',
                        min: -60,
                        max: 60
                    },
                    {
                        id: 14,
                        name: 'kHR',
                        direction: 'rtl',
                        min: -60,
                        max: 60
                    },
                    {
                        id: 15,
                        name: 'kHL',
                        direction: 'rtl',
                        min: -60,
                        max: 60
                    }
                ],
                change: (index) => {
                    let value = vue.$data['m' + index];
                    if (value != m[index].getValue()) {
                        let min = vue.$data['b' + index].min;
                        let max = vue.$data['b' + index].max;
                        m[index].writeValue(Math.max(min, Math.min(value, max)));
                        m.forEach((item) => {
                            let sync = vue.$data['b' + index].sync && vue.$data['b' + item.getIndex()].sync;
                            if (index != item.getIndex() && sync) {
                                let min = vue.$data['b' + item.getIndex()].min;
                                let max = vue.$data['b' + item.getIndex()].max;
                                vue.$refs['m' + item.getIndex()][0].setValue(Math.max(min, Math.min(value, max)));
                            }
                        });
                    }
                },
                dragstart: () => {
                    $(vue.$refs.autoUpdate).data('checked', vue.$data.autoUpdate);
                    vue.$set(vue.$refs.autoUpdate, 'checked', false);
                },
                dragend: () => {
                    vue.$set(vue.$refs.autoUpdate, 'checked', $(vue.$refs.autoUpdate).data('checked'));
                }
            };

            m.forEach((item) => {
                let slider = data.sliders.filter(s => s.id == item.getIndex())[0];
                data['m' + item.getIndex()] = item.getValue();
                data['b' + item.getIndex()] = $.extend(slider, {
                        dotSize: 20,
                        tooltip: 'always',
                        tooltipPlacement: 'top',
                        interval: 1,
                        duration: 0,
                        lazy: true,
                        contained: false,
                        useKeyboard: true,
                        sync: false
                    },
                    {
                        sid: 's' + item.getIndex(),
                        mid: 'm' + item.getIndex(),
                        bid: 'b' + item.getIndex(),
                        style: 'slider ' + slider.direction + ' ' + ([3, 4, 5, 6, 7].includes(slider.id) ? 'inactive' : 'active'),
                        width: ['ltr', 'rtl'].includes(slider.direction) ? 300 : 5,
                        height: ['ttb', 'btt'].includes(slider.direction) ? 300 : 5,
                        process: (p) => [[(Math.abs(slider.min) * 100 / (Math.abs(slider.min) + Math.abs(slider.max))), p[0]]]
                    });
            });

            return data;
        },
        components: {
            'vueSlider': window['vue-slider-component'],
        }
    });

    vue.$data.autoUpdateRate(1000);

    let joystick = {
        size: 80,
        mode: 'static',
        position: {
            left: '50%',
            top: '50%'
        }
    };

    let c = ocw.Command();
    nipplejs.create($.extend(joystick, {
        zone: $('#left')[0],
        color: '#007acc'
    })).on('move, end', (e, data) => {
        let cActive = c.getCommand();
        let direction = data.direction ? data.direction.y + '|' + data.direction.angle : 'stop';
        switch (direction) {
            case 'up|up':
                c.setCommand('ktr');
                break;
            case 'up|left':
                c.setCommand('kwkL');
                break;
            case 'up|right':
                c.setCommand('kwkR');
                break;
            case 'down|down':
                c.setCommand('kbk');
                break;
            case 'down|left':
                c.setCommand('kbkL');
                break;
            case 'down|right':
                c.setCommand('kbkR');
                break;
            default:
                c.setCommand('kbalance');
                break;
        }
        if (c.getCommand() != cActive) {
            c.writeCommand();
        }
    });

    let i = ocw.move.I(0, m[0].getValue(), 1, m[1].getValue());
    nipplejs.create($.extend(joystick, {
        zone: $('#right')[0],
        color: '#f0b400'
    })).on('move, end', (e, data) => {
        let iActive = i.getIndexValue();
        let direction = data.direction ? data.direction.y + '|' + data.direction.angle : 'stop';
        let force = data.force ? data.force / 2 : 0;
        let left = Math.min(vue.$data['b0'].max, vue.$data['b0'].max * force);
        let right = Math.max(vue.$data['b0'].min, vue.$data['b0'].min * force);
        let up = Math.min(vue.$data['b1'].max, vue.$data['b1'].max * force);
        let down = Math.max(vue.$data['b1'].min, vue.$data['b1'].min * force);
        switch (direction) {
            case 'up|up':
                i.setIndexValue(0, iActive[1], 1, up);
                break;
            case 'up|left':
                i.setIndexValue(0, left, 1, iActive[0]);
                break;
            case 'up|right':
                i.setIndexValue(0, right, 1, iActive[0]);
                break;
            case 'down|down':
                i.setIndexValue(0, iActive[1], 1, down);
                break;
            case 'down|left':
                i.setIndexValue(0, left, 1, iActive[0]);
                break;
            case 'down|right':
                i.setIndexValue(0, right, 1, iActive[0]);
                break;
            default:
                i.setIndexValue(0, 0, 1, 0);
                break;
        }
        if (JSON.stringify(i.getIndexValue()) != JSON.stringify(iActive)) {
            i.writeIndexValue();
        }
    });
});
