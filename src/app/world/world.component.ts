import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit {

  @ViewChild('worldSvg', { static: true }) worldSvg!: ElementRef;

  svgPath = 'assets/world-map.svg';
  paths: string[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.readSVG(this.svgPath);
  }

  readSVG(svgPath: string) {
    this.http.get(svgPath, { responseType: 'text' })
      .subscribe(str => {
        this.paths = str.match(/<path[^>]*>/g) || [];
        if (this.paths.length > 0) {
          this.paths.forEach((path, index) => {
            const dAttribute = this.getAttribute('d', path);
            const nameAttribute = this.getAttribute('name', path);
            const idAttribute = this.getAttribute('id', path);
            const newSvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            newSvgPath.setAttribute('d', dAttribute);
            newSvgPath.setAttribute('name', nameAttribute);
            newSvgPath.setAttribute('id', idAttribute);

            newSvgPath.addEventListener('mouseover', () => {
              newSvgPath.setAttribute('fill', 'lightblue');
              
            });
            newSvgPath.addEventListener('click', () => {
              this.getDataFromAPI(idAttribute);
            })

            newSvgPath.addEventListener('mouseout', () => {
              newSvgPath.setAttribute('fill', '');
            });

            this.worldSvg.nativeElement.appendChild(newSvgPath);
          });
        }
      });
  }

  getAttribute(attributeName: string, path: string): string {
    const match = path.match(new RegExp(attributeName + '="([^"]*)"', 'i'));
    return match ? match[1] : '';
  }

  getDataFromAPI(id: string) {
    const wordBank = 'https://api.worldbank.org/v2/country/' + id + '?format=json';
    interface WorldBankResponse {
      0: any[];
      1: {
        name: string;
        capitalCity: string;
        region: { value: string };
        incomeLevel: { value: string };
        latitude: string;
        longitude: string;
      }[];
    }
    this.http.get<WorldBankResponse>(wordBank)
      .subscribe((data: WorldBankResponse) => {
        if (data[1] && data[1].length > 0) {
          const countryName = data[1][0].name;
          const countryCapitalCity = data[1][0].capitalCity;
          const countryRegion = data[1][0].region.value;
          const incomeLevel = data[1][0].incomeLevel.value;
          const countryLatitude = data[1][0].latitude;
          const countryLongitude = data[1][0].longitude;

          let response = {
            name: countryName,
            incomeLevel: incomeLevel,
            capitalCity: countryCapitalCity,
            region: countryRegion,
            latitude: countryLatitude,
            longitude: countryLongitude
          };

          console.log(response);
          this.appendDataToDiv(response);
        } else {
          this.handleNoData();
        }
      });
  }


  appendDataToDiv(data: any) {
    const countryName = document.getElementById('countryName');
    const countryCapitalCity = document.getElementById('countryCapitalCity');
    const countryRegion = document.getElementById('countryRegion');
    const incomeLevel = document.getElementById('incomeLevel');
    const countryLatitude = document.getElementById('countryLatitude');
    const countryLongitude = document.getElementById('countryLongitude');

    countryName!.innerHTML = data.name;
    countryCapitalCity!.innerHTML = data.capitalCity;
    countryRegion!.innerHTML = data.region;
    incomeLevel!.innerHTML = data.incomeLevel;
    countryLatitude!.innerHTML = data.latitude;
    countryLongitude!.innerHTML = data.longitude;
  }

handleNoData() {
  const countryName = document.getElementById('countryName');
  const countryCapitalCity = document.getElementById('countryCapitalCity');
  const countryRegion = document.getElementById('countryRegion');
  const incomeLevel = document.getElementById('incomeLevel');
  const countryLatitude = document.getElementById('countryLatitude');
  const countryLongitude = document.getElementById('countryLongitude');

  if (countryName) {
    countryName.innerHTML = 'Please select another country, no data information provided by World Bank';
  }

  if (countryCapitalCity) {
    countryCapitalCity.innerHTML = '';
  }
  if (countryRegion) {
    countryRegion.innerHTML = '';
  }
  if (incomeLevel) {
    incomeLevel.innerHTML = '';
  }
  if (countryLatitude) {
    countryLatitude.innerHTML = '';
  }
  if (countryLongitude) {
    countryLongitude.innerHTML = '';
  }
}
}
