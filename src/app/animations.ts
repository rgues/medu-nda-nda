import { trigger, transition, animate, style, state, keyframes, animation,
            useAnimation, query, animateChild, stagger } from '@angular/animations';

export let blockAnim = animation([
        animate('{{duration}} {{easing}}',
        keyframes([
            style({offset: 0, opacity: 0, transform: 'translate3d(0, 100%, 0)'}),
            style({offset: 1, opacity: 1, transform: 'translate3d(0, 0, 0)'})
        ])
    )]
    , {
        params: {
            duration: '0.3s',
            easing: 'ease'
        }
    }
);

export let fadeIn = trigger('fadeIn', [
                transition(':enter', [
                    style({opacity: 0}),
                    animate('1s ease-in-out', style({opacity: 1}))
                ])
            ]);
export let rotate = trigger('rotate', [
                transition(':enter', [
                    style({opacity: 0, transform: 'rotate3d(0,1,0,40deg)'}),
                    animate(1000, style({opacity: 1, transform: 'rotate3d(0,1,0,0deg)'}))
                ])
            ]);
export let slideRight = trigger('slideRight', [
                    state('void', style({opacity: 0, transform: 'translateX(50%)'})),
                    transition(':enter', [
                        animate('0.5s 1s cubic-bezier(.17,.67,.83,.67)', style({opacity: 1, transform: 'translateX(0%)'}))
                ])
            ]);
export let slideInLeft = trigger('slideInLeft', [
                transition(':enter', [
                    style({ transform: 'translateX(-2rem)', opacity: 0}),
                    animate('0.2s 0.2s cubic-bezier(.17,.67,.83,.67)')
                ])
            ]);
export let slideInDown = trigger('slideInDown', [
                transition(':enter', [
                    style({transform: 'translate3d(0, -100%, 0)', visibility: 'visible'}),
                    animate(500, style({transform: 'translate3d(0, 0, 0)'}))
                ])
            ]);
export let slideOutLeft = trigger('slideOutLeft', [
                transition(':leave', [
                    style({ opacity: 1}),
                    animate('1s cubic-bezier(.17,.67,.83,.67)', style({
                        opacity: 0,
                        transform: 'translateX(2rem)'
                    }))
                ])
            ]);
export let slideBlock = trigger('slideBlock', [
                transition(':enter', useAnimation(blockAnim), {
                    params: {
                        duration: '1s',
                        easing: 'ease-in-out'
                    }
                })
            ]);
export let slidePage = trigger('slidePage', [
                transition(':enter', [
                    query('@slideBlock', stagger(100, animateChild()))
                ])

            ]);
