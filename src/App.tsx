import React, { Component } from 'react';
import './App.css';

import {Grid, GridColumn, GridSortSettings, GridSortChangeEvent} from '@progress/kendo-react-grid';
import {GridFilterChangeEvent, GridRowClickEvent, GridItemChangeEvent} from '@progress/kendo-react-grid';
import {GridToolbar} from '@progress/kendo-react-grid';
// Used for sorting and filtering grid content
import { orderBy, SortDescriptor, filterBy, CompositeFilterDescriptor, FilterDescriptor} from '@progress/kendo-data-query';

import sampleProducts from './data/products.json';

interface ProductCategory {
  CategoryID : number,
  CategoryName : string,
  Description : string
}
interface Product {
  ProductID : number,
  ProductName : string,
  SupplierID : number,
  CategoryID : number,
  QuantityPerUnit : string,
  UnitPrice : number,
  UnitsInStock : number,
  UnitsOnOrder : number,
  ReorderLevel : number,
  Discontinued : boolean,
  Category : ProductCategory | null,
  inEditor? : boolean
}

interface AppProps { }
interface AppState {
  products: Product[],
  sort: SortDescriptor[],
  filter: CompositeFilterDescriptor,
  productInEditor : number | null  // ID of product currently edited, null if no record is in edited
}

class App extends Component<AppProps, AppState> {
  private appName: string = 'My third app with React, TypeScript, KendoReact Grid';

  constructor(props: AppProps) {
    super(props);
    this.state = {
      products: sampleProducts,
      sort: [
        {field: 'price', dir: 'asc'} as SortDescriptor
      ],
      filter: { 
        logic: 'and', 
        filters: [
          { 
            field: 'ProductName', 
            operator: 'contains', 
            value: 'j', 
            ignoreCase: true 
          }
        ]  
      },
      productInEditor: null
    };
  }

  render() {
    let products = filterBy(this.state.products, this.state.filter);
    products = orderBy(products, this.state.sort);
    products = products.map(p => Object.assign(p, {inEditor: p.ProductID === this.state.productInEditor}));
    const sortSettings: GridSortSettings = { mode: 'single', allowUnsort: false };
    const isFinishDisabled = this.state.productInEditor == null;
    console.log(`111: ${this.state.productInEditor}`);
    console.log(`Finish: ${isFinishDisabled}`);
    return (
      <div>
        <h1>{this.appName}</h1>
        <Grid data={products} 

              sortable={sortSettings} 
              sort={this.state.sort} 
              onSortChange={(e)=>this.onSortChanged(e)}

              filterable
              filter={this.state.filter}
              onFilterChange={(e)=>this.onFilterChanged(e)}

              editField="inEditor"
              onRowClick={(e)=>this.onRowClicked(e)}
              onItemChange={(e)=>this.onItemChanged(e)}
        >
          <GridToolbar>
            <div onClick={(e)=>this.closeEditor(e)}>
               <button title="Add new" className="k-button k-primary" onClick={()=>this.addProduct()}>Add new</button>
               <button title="Finish editing" className="k-button k-secondary"  disabled={isFinishDisabled} onClick={()=>this.finishEditing()}>Finish editing</button>
            </div>
          </GridToolbar >
          <GridColumn field="ProductID"    title="Product ID"           filter="numeric" editable={false}/>
          <GridColumn field="ProductName"  title="Product name"/>
          <GridColumn field="UnitPrice"    title="Price" format="{0:c}" filter="numeric" editor="numeric"/>
          <GridColumn field="UnitsInStock" title="Count"                filter="numeric" editor="numeric"/>
        </Grid>
      </div>
    );
  }

  public onSortChanged(event: GridSortChangeEvent): void {
    // Terminate any edit mode
    this.setState({productInEditor: null});

    this.setState({sort : event.sort});
    if (event.sort.length > 0) {
      console.log(`Sort ${event.sort[0].field} ${event.sort[0].dir}`);
    } else {
      console.log('Unsorted');
    }
  }

  public onFilterChanged(event: GridFilterChangeEvent): void {
    // Terminate any edit mode
    this.setState({productInEditor: null});

    this.setState({filter: event.filter});
    if (event.filter != null) {
      console.log(`Filter logical operator: ${event.filter.logic}`);
      for (let fd of event.filter.filters) {
        if ((fd as FilterDescriptor).field) {}
        const fd2: FilterDescriptor = fd as FilterDescriptor;
        console.log(`  ${fd2.field} ${fd2.operator} ${fd2.value}`);
      }  
    }
  }

  public onRowClicked(event: GridRowClickEvent): void {
    const product = (event.dataItem != null) ? event.dataItem as Product : null;
    if (product !== null) {
      this.setState({productInEditor: product.ProductID})
      console.log(`Selected ProductId ${product.ProductID}`);
    } else {
      console.log('Selected no product');
    }
  }

  public onItemChanged(event: GridItemChangeEvent): void {
    const currentProduct = (event.dataItem != null) ? event.dataItem as Product : null;
    if (currentProduct !== null && event.field !== null) {
      const products = this.state.products;
      const index = products.findIndex(p => p.ProductID === currentProduct.ProductID);
      const editedFieldName = event.field as string;
      // Update value of field currently edited
      products[index] = {...products[index], [editedFieldName]: event.value};
      this.setState({products: products});
    }
  }

  public addProduct(): void {
    // Clear filter or we may not see the row for editing the new product!
    this.setState({filter: {logic: 'and', filters: []}});

    const newProduct = this.createNewProduct(this.state.products.length + 1);
    const p = this.state.products.slice();
    p.unshift(newProduct);
    this.setState({
        products: p,
        productInEditor: newProduct.ProductID
    });
  }

  public closeEditor(event: React.MouseEvent<HTMLElement>): void {
    if (event.target === event.currentTarget) {
      this.setState({productInEditor: null})
    }
  }

  public finishEditing(): void {
    this.setState({productInEditor: null})
  }

  private createNewProduct(id: number): Product {
    return {
      ProductID : id,
      ProductName : '',
      SupplierID : 0,
      CategoryID : 0,
      QuantityPerUnit : '',
      UnitPrice : 0,
      UnitsInStock : 0,
      UnitsOnOrder : 0,
      ReorderLevel : 0,
      Discontinued : false,
      Category : null,
      inEditor : true
    };
  }
}

export default App;
