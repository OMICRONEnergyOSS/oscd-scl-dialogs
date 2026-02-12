<?xml version="1.0" encoding="UTF-8"?>
<SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B" release="5">
	<Header id="development sample"/>
	<Substation name="S1">
		<VoltageLevel name="V1">
			<Bay name="B2"/>
			<Bay name="B1"/>
		</VoltageLevel>
	</Substation>
	<IED name="IED1" manufacturer="OpenSCD">
		<AccessPoint name="AP1">
			<Server>
				<Authentication/>
				<LDevice inst="LD1">
					<LN0 lnClass="LLN0" inst="" lnType="LLN0_Test">
						<SettingControl numOfSGs="5"/>
					</LN0>
					<LN lnClass="TCTR" inst="1" lnType="TCTR_Test">
						<DOI name="Beh">
							<DAI name="stVal">
								<Val>blocked</Val>
							</DAI>
						</DOI>
						<DOI name="ARtg">
							<DAI name="setVal">
								<Val sGroup="1">10</Val>
								<Val sGroup="2">12</Val>
								<Val sGroup="3">13</Val>
								<Val sGroup="4">14</Val>
								<Val sGroup="5">15</Val>
							</DAI>
							<DAI name="setMag">
								<Val sGroup="1">100</Val>
								<Val sGroup="5">120</Val>
							</DAI>
						</DOI>
					</LN>
				</LDevice>
				<LDevice inst="LD2">
					<LN0 lnClass="LLN0" inst="" lnType="LLN0_Test">
						<SettingControl numOfSGs="7"/>
					</LN0>
					<LN lnClass="TCTR" inst="2" lnType="TCTR_Test"/>
				</LDevice>
				<LDevice inst="LD3">
					<LN0 lnClass="LLN0" inst="" lnType="LLN0_Test"/>
					<!-- Case 1: LN has nothing -->
					<LN lnClass="TCTR" inst="1" lnType="TCTR_Test"/>
					<!-- Case 2: DOI exists, empty -->
					<LN lnClass="TCTR" inst="2" lnType="TCTR_Test">
						<DOI name="HzRtg"/>
					</LN>
					<!-- Case 3: DOI exists, unrelated DAI -->
					<LN lnClass="TCTR" inst="3" lnType="TCTR_Test">
						<DOI name="HzRtg">
							<DAI name="units"/>
						</DOI>
					</LN>
					<!-- Case 4: DOI exists, SDI exists, but missing target DAI -->
					<LN lnClass="TCTR" inst="4" lnType="TCTR_Test">
						<DOI name="HzRtg">
							<SDI name="setMag"/>
						</DOI>
					</LN>
					<!-- Case 5: SDI exists, DAI exists, but no Val -->
					<LN lnClass="TCTR" inst="5" lnType="TCTR_Test">
						<DOI name="HzRtg">
							<SDI name="setMag">
								<DAI name="i"/>
							</SDI>
						</DOI>
					</LN>
					<!-- Case 6: Everything exists, must not touch -->
					<LN lnClass="TCTR" inst="6" lnType="TCTR_Test">
						<DOI name="HzRtg">
							<SDI name="setMag">
								<DAI name="i">
									<Val>50</Val>
								</DAI>
							</SDI>
						</DOI>
					</LN>
					<!-- Case 7: Simple DA, DOI exists but wrong DAI -->
					<LN lnClass="TCTR" inst="7" lnType="TCTR_Test">
						<DOI name="ARtg">
							<DAI name="setVal"/>
						</DOI>
					</LN>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<IED name="IED1" manufacturer="OpenSCD">
		<AccessPoint name="AP2">
			<Services>
				<DynAssociation />
				<SettingGroups>
					<SGEdit resvTms="true" />
					<ConfSG resvTms="true" />
				</SettingGroups>
				<GetDirectory />
				<GetDataObjectDefinition />
				<GetDataSetValue />
				<DataSetDirectory />
				<ReadWrite />
				<ConfDataSet max="16" maxAttributes="256" modify="true" />
				<LogSettings
						cbName="Fix"
						datSet="Conf"
						logEna="Conf"
						trgOps="Conf"
						intgPd="Conf"
					/>
				<ConfLogControl max="8" />
				<ReportSettings
						cbName="Fix"
						datSet="Conf"
						rptID="Conf"
						optFields="Conf"
						bufTime="Conf"
						trgOps="Conf"
						intgPd="Conf"
					/>
				<ConfReportControl max="8" buffered="true" />
				<GSESettings cbName="Fix" datSet="Conf" />
				<ConfGSEControl max="8" />
				<SMVSettings cbName="Fix" datSet="Conf">
					<McSecurity signature="true" encryption="true" />
					<SamplesPerSec>4000</SamplesPerSec>
					<SecPerSamples>80</SecPerSamples>
				</SMVSettings>
				<ConfSMVControl max="4" />
				<ClientServices readLog="true">
					<TimeSyncProt
						yes="true"
						sntp="true"
						iec61850_9_3="true"
						c37_238="false"
						other="false"
						/>
					<McSecurity signature="true" encryption="false" />
				</ClientServices>
				<TimeSyncProt
						yes="true"
						sntp="true"
						iec61850_9_3="false"
						c37_238="false"
						other="false"
					/>
			</Services>
			<Server>
				<Authentication/>
				<LDevice inst="LD2">
					<LN0 lnClass="LLN0" inst="" lnType="LLN0_Test"/>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<DataTypeTemplates>
		<LNodeType lnClass="LLN0" id="LLN0_Test">
			<DO name="Beh" type="Beh_Test"/>
		</LNodeType>
		<LNodeType lnClass="TCTR" id="TCTR_Test">
			<DO name="Beh" type="Beh_Test"/>
			<DO name="NestedBeh" type="NestedBeh_Test"/>
			<DO name="HzRtg" type="HzRtg_Test"/>
			<DO name="ARtg" type="ARtg_Test"/>
		</LNodeType>
		<DOType cdc="ENS" id="Beh_Test">
			<DA name="stVal" fc="ST" dchg="true" dupd="true" bType="Enum" type="stVal_enums"/>
			<DA name="q" fc="ST" qchg="true" bType="Quality"/>
			<DA name="t" fc="ST" bType="Timestamp"/>
		</DOType>
		<DOType cdc="ENS" id="NestedBeh_Test">
			<SDO name="subBeh" type="Beh_Test"/>
		</DOType>
		<DOType cdc="ASG" id="ARtg_Test">
			<DA name="setVal" desc="fc=SG" fc="SG" bType="INT32"/>
			<DA name="setMag" desc="fc=SE" fc="SE" bType="INT32">
				<Val>555</Val>
			</DA>
		</DOType>
		<DOType cdc="ASG" id="HzRtg_Test">
			<DA name="setMag" fc="SE" bType="Struct" type="AnalogueValueCtl"/>
			<DA name="units" fc="CF" bType="Struct" type="Unit"/>
			<DA name="sVC" fc="CF" bType="Struct" type="ScaledValueConfig"/>
			<DA name="minVal" fc="CF" bType="Struct" type="AnalogueValue"/>
			<DA name="maxVal" fc="CF" bType="Struct" type="AnalogueValue"/>
			<DA name="stepSize" fc="CF" bType="Struct" type="AnalogueValue"/>
		</DOType>
		<DAType id="AnalogueValueCtl">
			<BDA name="i" bType="INT32"/>
			<BDA name="range" bType="Struct" type="RangeStruct"/>
		</DAType>
		<DAType id="RangeStruct">
			<BDA name="min" bType="INT32"/>
			<BDA name="max" bType="INT32"/>
		</DAType>
		<DAType id="AnalogueValue">
			<BDA name="i" bType="INT32"/>
		</DAType>
		<DAType id="ScaledValueConfig">
			<BDA name="scaleFactor" bType="FLOAT32" valKind="RO">
				<Val>0.001</Val>
			</BDA>
			<BDA name="offset" bType="FLOAT32" valKind="RO">
				<Val>0.0</Val>
			</BDA>
		</DAType>
		<DAType id="Unit">
			<BDA name="SIUnit" bType="Enum" type="SIUnitKind"/>
			<BDA name="multiplier" bType="Enum" type="MultiplierKind"/>
		</DAType>
		<EnumType id="SIUnitKind">
			<EnumVal ord="1">Hz</EnumVal>
		</EnumType>
		<EnumType id="MultiplierKind">
			<EnumVal ord="0">none</EnumVal>
		</EnumType>
		<EnumType id="stVal_enums">
			<EnumVal ord="1">on</EnumVal>
			<EnumVal ord="2">blocked</EnumVal>
			<EnumVal ord="3">test</EnumVal>
			<EnumVal ord="4">test/blocked</EnumVal>
			<EnumVal ord="5">off</EnumVal>
		</EnumType>
	</DataTypeTemplates>
</SCL>
