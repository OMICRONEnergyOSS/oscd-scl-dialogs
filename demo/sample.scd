<?xml version="1.0" encoding="UTF-8"?>
<SCL xmlns="http://www.iec.ch/61850/2003/SCL"
     version="2007"
     revision="B"
     release="5">
	<Header id="development sample"/>
	<Substation name="S1">
		<VoltageLevel name="V1">
			<Bay name="B1">
				<ConductingEquipment name="Q1" type="CBR">
					<EqFunction name="Protection">
						<LNode iedName="IED1"
                   ldInst="LD1"
                   lnClass="LLN0"
                   lnInst=""
                   lnType="LLN0_Test"/>
					</EqFunction>
				</ConductingEquipment>
			</Bay>
			<Bay name="B2"/>
		</VoltageLevel>
	</Substation>
	<IED name="IED1">
		<AccessPoint name="AP1">
			<Server>
				<LDevice inst="LD1">
					<LN0 lnClass="LLN0" lnType="LLN0_Test" inst=""/>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<DataTypeTemplates>
		<LNodeType lnClass="LLN0" id="LLN0_Test">
			<DO name="Beh" type="Beh_Test" desc="poo"/>
		</LNodeType>
		<DOType cdc="ENS" id="Beh_Test">
			<DA name="stVal"
          fc="ST"
          dchg="true"
          dupd="true"
          bType="Enum"
          type="stVal_enums"/>
			<DA name="q"
          fc="ST"
          qchg="true"
          bType="Quality"/>
			<DA name="t"
          fc="ST"
          bType="Timestamp"/>
		</DOType>
		<EnumType id="stVal_enums">
			<EnumVal ord="1">on</EnumVal>
			<EnumVal ord="2">blocked</EnumVal>
			<EnumVal ord="3">test</EnumVal>
			<EnumVal ord="4">test/blocked</EnumVal>
			<EnumVal ord="5">off</EnumVal>
		</EnumType>
	</DataTypeTemplates>
</SCL>
