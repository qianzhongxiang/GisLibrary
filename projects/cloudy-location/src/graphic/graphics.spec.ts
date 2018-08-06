import { GetGraphicFactory } from './graphics';
import { TestBed, inject } from '@angular/core/testing';
import { Graphic } from '.';

class testSubTypeGraphic extends Graphic { }
class testTypeGraphic extends Graphic { }
class basicGraphic extends Graphic { }
class reSubType extends Graphic { }
class reType extends Graphic { }

describe('graphic factory', () => {
  let factory = GetGraphicFactory();
  factory.SetComponent(testSubTypeGraphic, "type.subType");
  factory.SetComponent(testTypeGraphic, "type");
  factory.SetDef(basicGraphic, "base");
  it('Get component with subtype', () => {
    expect(factory.GetComponent("tYpe.suBType")).toEqual(jasmine.any(testSubTypeGraphic))
  })
  it('should be same graphic from twice call', () => {
    expect(factory.GetComponent("type.subtype")).toBe(factory.GetComponent("type.subType"))
    expect(factory.GetComponent("type")).toBe(factory.GetComponent("type"))
  })
  it('Should be Type', () => {
    expect(factory.GetComponent("type")).toEqual(jasmine.any(testTypeGraphic))
  })
  it('Get component without coincident subtype but type', () => {
    expect(factory.GetComponent("type.subType1")).toEqual(jasmine.any(testTypeGraphic))
  })
  it('should be basic graphic by GetDef("base")', () => {
    expect(factory.GetDef("base")).toEqual(jasmine.any(basicGraphic))
  })
  it('basic exists in default group of factory', () => {
    expect(factory.DefsContains("Base")).toBeTruthy()
  })
  it('should be basic component with out both coincident type and subtype', () => {
    expect(factory.GetComponent('')).toEqual(jasmine.any(basicGraphic))
    expect(factory.GetComponent("type1.subtype1")).toEqual(jasmine.any(basicGraphic))
  })
  it('should  be changed component after recall setComponent method', () => {
    factory.SetComponent(reType, 'type')
    factory.SetComponent(reSubType, 'type.subType')
    expect(factory.GetComponent('type')).toEqual(jasmine.any(reType))
    expect(factory.GetComponent('type.subType')).toEqual(jasmine.any(reSubType))
  })
});
