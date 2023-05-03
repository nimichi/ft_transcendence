import { Component } from '@angular/core';

@Component({
  selector: 'app-list',
  template: `
    <div class="table">
      <div class="table-row header">
        <div class="table-cell">Versus</div>
        <div class="table-cell">Result</div>
        <div class="table-cell">Level</div>
      </div>
      <div class="table-row" *ngFor="let item of items">
        <div class="table-cell">{{ item.versus }}</div>
        <div class="table-cell">{{ item.result }}</div>
        <div class="table-cell">{{ item.level }}</div>
      </div>
    </div>
  `,
  styles: [
    `
      .table {
        display: table;
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
      }
      .table-row {
        display: table-row;
        border-bottom: 1px solid #e2e8f0;
      }
      .table-cell {
        display: table-cell;
        padding: 8px;
        text-align: left;
        vertical-align: middle;
      }
      .header {
        font-weight: bold;
      }
    `,
  ],
})
export class ListComponent {
  items = [    { versus: 'Player 1 vs Player 2', result: 'Win', level: 'Expert' },    { versus: 'Player 3 vs Player 4', result: 'Loss', level: 'Beginner' },  ];
}
