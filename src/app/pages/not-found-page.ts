import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ imports:[RouterLink], template:`<section class="not-found wrap"><span>404</span><h1>This row does not exist.</h1><p>The page may have moved or the URL is incomplete.</p><a class="button button--primary" routerLink="/">Return home →</a></section>`, styles:[`.not-found{min-height:65vh;padding-block:9rem;text-align:center}.not-found span{color:var(--blue);font:1rem var(--mono)}.not-found h1{margin:1rem 0;font-size:clamp(3rem,8vw,7rem);letter-spacing:-.075em}.not-found p{margin:0 0 2rem;color:var(--muted)}`] })
export class NotFoundPage {}
